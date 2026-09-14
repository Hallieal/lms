export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      announcements: {
        Row: { body: string; course_id: string; created_at: string; created_by: string; id: string; publish_at: string | null; published: boolean; title: string; updated_at: string };
        Insert: { body: string; course_id: string; created_at?: string; created_by: string; id?: string; publish_at?: string | null; published?: boolean; title: string; updated_at?: string };
        Update: { body?: string; course_id?: string; created_at?: string; created_by?: string; id?: string; publish_at?: string | null; published?: boolean; title?: string; updated_at?: string };
        Relationships: [
          { foreignKeyName: "announcements_course_id_fkey"; columns: ["course_id"]; isOneToOne: false; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "announcements_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      assignments: {
        Row: { allow_late: boolean; allow_resubmission: boolean; course_id: string; created_at: string; created_by: string; due_at: string | null; id: string; instructions: string | null; max_points: number; module_id: string | null; published: boolean; release_at: string | null; title: string; updated_at: string };
        Insert: { allow_late?: boolean; allow_resubmission?: boolean; course_id: string; created_at?: string; created_by: string; due_at?: string | null; id?: string; instructions?: string | null; max_points: number; module_id?: string | null; published?: boolean; release_at?: string | null; title: string; updated_at?: string };
        Update: { allow_late?: boolean; allow_resubmission?: boolean; course_id?: string; created_at?: string; created_by?: string; due_at?: string | null; id?: string; instructions?: string | null; max_points?: number; module_id?: string | null; published?: boolean; release_at?: string | null; title?: string; updated_at?: string };
        Relationships: [
          { foreignKeyName: "assignments_course_id_fkey"; columns: ["course_id"]; isOneToOne: false; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "assignments_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "assignments_module_id_fkey"; columns: ["module_id"]; isOneToOne: false; referencedRelation: "modules"; referencedColumns: ["id"] }
        ];
      };
      calendar_events: {
        Row: { course_id: string | null; created_at: string; created_by: string; ends_at: string | null; event_type: string | null; id: string; location: string | null; starts_at: string; title: string };
        Insert: { course_id?: string | null; created_at?: string; created_by: string; ends_at?: string | null; event_type?: string | null; id?: string; location?: string | null; starts_at: string; title: string };
        Update: { course_id?: string | null; created_at?: string; created_by?: string; ends_at?: string | null; event_type?: string | null; id?: string; location?: string | null; starts_at?: string; title?: string };
        Relationships: [
          { foreignKeyName: "calendar_events_course_id_fkey"; columns: ["course_id"]; isOneToOne: false; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "calendar_events_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      course_members: {
        Row: { course_id: string; joined_at: string; role: Database["public"]["Enums"]["course_role"]; user_id: string };
        Insert: { course_id: string; joined_at?: string; role: Database["public"]["Enums"]["course_role"]; user_id: string };
        Update: { course_id?: string; joined_at?: string; role?: Database["public"]["Enums"]["course_role"]; user_id?: string };
        Relationships: [
          { foreignKeyName: "course_members_course_id_fkey"; columns: ["course_id"]; isOneToOne: false; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "course_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      courses: {
        Row: { academic_year: number; code: string; created_at: string; created_by: string; description: string | null; id: string; status: Database["public"]["Enums"]["course_status"]; term: string; title: string; updated_at: string };
        Insert: { academic_year: number; code: string; created_at?: string; created_by: string; description?: string | null; id?: string; status?: Database["public"]["Enums"]["course_status"]; term: string; title: string; updated_at?: string };
        Update: { academic_year?: number; code?: string; created_at?: string; created_by?: string; description?: string | null; id?: string; status?: Database["public"]["Enums"]["course_status"]; term?: string; title?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "courses_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      grades: {
        Row: { assignment_id: string; created_at: string; feedback: string | null; graded_at: string | null; graded_by: string | null; id: string; published_at: string | null; score: number | null; status: Database["public"]["Enums"]["grade_status"]; student_id: string; updated_at: string };
        Insert: { assignment_id: string; created_at?: string; feedback?: string | null; graded_at?: string | null; graded_by?: string | null; id?: string; published_at?: string | null; score?: number | null; status?: Database["public"]["Enums"]["grade_status"]; student_id: string; updated_at?: string };
        Update: { assignment_id?: string; created_at?: string; feedback?: string | null; graded_at?: string | null; graded_by?: string | null; id?: string; published_at?: string | null; score?: number | null; status?: Database["public"]["Enums"]["grade_status"]; student_id?: string; updated_at?: string };
        Relationships: [
          { foreignKeyName: "grades_assignment_id_fkey"; columns: ["assignment_id"]; isOneToOne: false; referencedRelation: "assignments"; referencedColumns: ["id"] },
          { foreignKeyName: "grades_graded_by_fkey"; columns: ["graded_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "grades_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      materials: {
        Row: { body: string | null; course_id: string; created_at: string; created_by: string; external_url: string | null; id: string; kind: Database["public"]["Enums"]["material_kind"]; module_id: string | null; position: number; published: boolean; release_at: string | null; storage_key: string | null; title: string; updated_at: string };
        Insert: { body?: string | null; course_id: string; created_at?: string; created_by: string; external_url?: string | null; id?: string; kind: Database["public"]["Enums"]["material_kind"]; module_id?: string | null; position?: number; published?: boolean; release_at?: string | null; storage_key?: string | null; title: string; updated_at?: string };
        Update: { body?: string | null; course_id?: string; created_at?: string; created_by?: string; external_url?: string | null; id?: string; kind?: Database["public"]["Enums"]["material_kind"]; module_id?: string | null; position?: number; published?: boolean; release_at?: string | null; storage_key?: string | null; title?: string; updated_at?: string };
        Relationships: [
          { foreignKeyName: "materials_course_id_fkey"; columns: ["course_id"]; isOneToOne: false; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "materials_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "materials_module_id_fkey"; columns: ["module_id"]; isOneToOne: false; referencedRelation: "modules"; referencedColumns: ["id"] }
        ];
      };
      modules: {
        Row: { course_id: string; created_at: string; description: string | null; id: string; position: number; release_at: string | null; title: string; updated_at: string };
        Insert: { course_id: string; created_at?: string; description?: string | null; id?: string; position?: number; release_at?: string | null; title: string; updated_at?: string };
        Update: { course_id?: string; created_at?: string; description?: string | null; id?: string; position?: number; release_at?: string | null; title?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "modules_course_id_fkey"; columns: ["course_id"]; isOneToOne: false; referencedRelation: "courses"; referencedColumns: ["id"] }];
      };
      profiles: {
        Row: { cohort: string | null; created_at: string; display_name: string; id: string; programme: string | null; updated_at: string };
        Insert: { cohort?: string | null; created_at?: string; display_name: string; id: string; programme?: string | null; updated_at?: string };
        Update: { cohort?: string | null; created_at?: string; display_name?: string; id?: string; programme?: string | null; updated_at?: string };
        Relationships: [];
      };
      submissions: {
        Row: { assignment_id: string; created_at: string; id: string; status: Database["public"]["Enums"]["submission_status"]; storage_key: string | null; student_id: string; submitted_at: string | null; text_response: string | null; updated_at: string };
        Insert: { assignment_id: string; created_at?: string; id?: string; status?: Database["public"]["Enums"]["submission_status"]; storage_key?: string | null; student_id: string; submitted_at?: string | null; text_response?: string | null; updated_at?: string };
        Update: { assignment_id?: string; created_at?: string; id?: string; status?: Database["public"]["Enums"]["submission_status"]; storage_key?: string | null; student_id?: string; submitted_at?: string | null; text_response?: string | null; updated_at?: string };
        Relationships: [
          { foreignKeyName: "submissions_assignment_id_fkey"; columns: ["assignment_id"]; isOneToOne: false; referencedRelation: "assignments"; referencedColumns: ["id"] },
          { foreignKeyName: "submissions_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      course_role: "student" | "ta" | "instructor";
      course_status: "draft" | "active" | "archived";
      grade_status: "draft" | "ready" | "published";
      material_kind: "file" | "link" | "text" | "code" | "data";
      submission_status: "draft" | "submitted" | "late";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
