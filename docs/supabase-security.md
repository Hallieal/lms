# Supabase authorization boundary

NES Learning treats PostgreSQL Row Level Security as the authorization boundary. UI state and client-side role switches are never security controls.

The exposed `public` schema contains application data. Authenticated users receive table privileges, but every domain table has RLS enabled and row access is constrained by course membership and ownership policies. The anonymous role has no domain-table privileges.

Membership lookup helpers use `SECURITY DEFINER` only to avoid recursive RLS checks on `course_members`. Those functions live in the non-exposed `app_private` schema, use an empty `search_path`, derive identity from `auth.uid()`, and are executable only by the authenticated database role.

`raw_user_meta_data` is used only to initialize display/profile fields. It is never used for authorization decisions.

Student submissions are constrained by assignment release and deadline rules. A student may update an existing submission only while it is still a draft or while the assignment allows resubmission. Late submission requires the assignment's explicit `allow_late` flag.

Storage will use separate `storage.objects` policies before file uploads are enabled in production. Service-role or secret API keys must never be exposed to the browser.