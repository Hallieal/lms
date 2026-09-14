'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const MAX_PDF_BYTES = 20 * 1024 * 1024;

function fail(assignmentId: string, message: string): never {
  redirect(`/assignments/${assignmentId}?error=${encodeURIComponent(message)}`);
}

function safeFilename(name: string) {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  return cleaned || 'submission.pdf';
}

export async function submitAssignment(formData: FormData) {
  const assignmentId = String(formData.get('assignmentId') ?? '');
  const file = formData.get('file');

  if (!assignmentId) redirect('/assignments?error=Missing%20assignment');
  if (!(file instanceof File) || file.size === 0) fail(assignmentId, 'Choose a PDF to submit.');
  if (file.type !== 'application/pdf') fail(assignmentId, 'Only PDF submissions are accepted right now.');
  if (file.size > MAX_PDF_BYTES) fail(assignmentId, 'The PDF must be 20 MB or smaller.');

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;
  if (!userId) redirect('/');

  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('id, due_at, allow_late, allow_resubmission')
    .eq('id', assignmentId)
    .maybeSingle();

  if (assignmentError || !assignment) fail(assignmentId, 'This assignment is not available to your account.');

  const now = new Date();
  const late = Boolean(assignment.due_at && now.getTime() > new Date(assignment.due_at).getTime());
  if (late && !assignment.allow_late) fail(assignmentId, 'The submission deadline has passed.');

  const { data: existing } = await supabase
    .from('submissions')
    .select('id, status, storage_key')
    .eq('assignment_id', assignmentId)
    .eq('student_id', userId)
    .maybeSingle();

  if (existing && existing.status !== 'draft' && !assignment.allow_resubmission) {
    fail(assignmentId, 'Resubmission is disabled for this assignment.');
  }

  const objectPath = `${assignmentId}/${userId}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
  const submittedStatus = late ? 'late' : 'submitted';
  const submittedAt = now.toISOString();

  if (!existing || existing.status === 'draft') {
    const { error: draftError } = await supabase.from('submissions').upsert(
      {
        assignment_id: assignmentId,
        student_id: userId,
        status: 'draft',
        storage_key: objectPath,
        submitted_at: null,
        updated_at: submittedAt,
      },
      { onConflict: 'assignment_id,student_id' },
    );

    if (draftError) fail(assignmentId, draftError.message);

    const { error: uploadError } = await supabase.storage.from('submissions').upload(objectPath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

    if (uploadError) fail(assignmentId, uploadError.message);

    const { error: finalizeError } = await supabase
      .from('submissions')
      .update({ status: submittedStatus, submitted_at: submittedAt, storage_key: objectPath, updated_at: submittedAt })
      .eq('assignment_id', assignmentId)
      .eq('student_id', userId);

    if (finalizeError) fail(assignmentId, finalizeError.message);
  } else {
    const { error: uploadError } = await supabase.storage.from('submissions').upload(objectPath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

    if (uploadError) fail(assignmentId, uploadError.message);

    const oldPath = existing.storage_key;
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: submittedStatus, submitted_at: submittedAt, storage_key: objectPath, updated_at: submittedAt })
      .eq('assignment_id', assignmentId)
      .eq('student_id', userId);

    if (updateError) {
      await supabase.storage.from('submissions').remove([objectPath]);
      fail(assignmentId, updateError.message);
    }

    if (oldPath && oldPath !== objectPath) {
      await supabase.storage.from('submissions').remove([oldPath]);
    }
  }

  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath('/assignments');
  revalidatePath('/dashboard');
  redirect(`/assignments/${assignmentId}?submitted=1`);
}
