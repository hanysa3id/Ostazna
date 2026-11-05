export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean
          name: string
          start_date: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean
          name: string
          start_date: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean
          name?: string
          start_date?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          created_at: string | null
          description_ar: string | null
          icon: string | null
          id: string
          is_active: boolean
          key: string
          name_ar: string
          name_en: string | null
          price_egp: number
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          name_ar: string
          name_en?: string | null
          price_egp?: number
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name_ar?: string
          name_en?: string | null
          price_egp?: number
        }
        Relationships: []
      }
      assistants: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean
          name: string
          permissions: Json
          teacher_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          name: string
          permissions?: Json
          teacher_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          permissions?: Json
          teacher_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistants_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          id: string
          notes: string | null
          recorded_at: string | null
          recorded_by: string
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          teacher_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          recorded_at?: string | null
          recorded_by: string
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          teacher_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          recorded_at?: string | null
          recorded_by?: string
          session_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          teacher_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          teacher_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          teacher_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          content_ar: Json
          content_en: Json
          created_at: string | null
          id: string
          is_published: boolean
          order_index: number
          page_type: Database["public"]["Enums"]["cms_page_type"]
          seo_meta: Json
          slug: string
          teacher_id: string
          title_ar: string
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          content_ar?: Json
          content_en?: Json
          created_at?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          page_type?: Database["public"]["Enums"]["cms_page_type"]
          seo_meta?: Json
          slug: string
          teacher_id: string
          title_ar: string
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          content_ar?: Json
          content_en?: Json
          created_at?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          page_type?: Database["public"]["Enums"]["cms_page_type"]
          seo_meta?: Json
          slug?: string
          teacher_id?: string
          title_ar?: string
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_settings: {
        Row: {
          contact_info: Json
          custom_css: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          sliders: Json
          social_links: Json
          teacher_id: string
          theme_config: Json
          updated_at: string | null
        }
        Insert: {
          contact_info?: Json
          custom_css?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          sliders?: Json
          social_links?: Json
          teacher_id: string
          theme_config?: Json
          updated_at?: string | null
        }
        Update: {
          contact_info?: Json
          custom_css?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          sliders?: Json
          social_links?: Json
          teacher_id?: string
          theme_config?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_settings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_submissions: {
        Row: {
          answers: Json
          exam_id: string
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          student_id: string
          submitted_at: string | null
          teacher_id: string
        }
        Insert: {
          answers?: Json
          exam_id: string
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id: string
          submitted_at?: string | null
          teacher_id: string
        }
        Update: {
          answers?: Json
          exam_id?: string
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id?: string
          submitted_at?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_submissions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_targets: {
        Row: {
          exam_id: string
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["notification_target"]
          teacher_id: string
        }
        Insert: {
          exam_id: string
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["notification_target"]
          teacher_id: string
        }
        Update: {
          exam_id?: string
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["notification_target"]
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_targets_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_targets_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          ends_at: string | null
          id: string
          pass_marks: number
          settings: Json
          starts_at: string | null
          status: Database["public"]["Enums"]["exam_status"]
          teacher_id: string
          title: string
          total_marks: number
          visibility: Database["public"]["Enums"]["exam_visibility"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          ends_at?: string | null
          id?: string
          pass_marks?: number
          settings?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["exam_status"]
          teacher_id: string
          title: string
          total_marks?: number
          visibility?: Database["public"]["Enums"]["exam_visibility"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          ends_at?: string | null
          id?: string
          pass_marks?: number
          settings?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["exam_status"]
          teacher_id?: string
          title?: string
          total_marks?: number
          visibility?: Database["public"]["Enums"]["exam_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "exams_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          teacher_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          teacher_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string | null
          expense_date: string
          id: string
          receipt_url: string | null
          teacher_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          expense_date: string
          id?: string
          receipt_url?: string | null
          teacher_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          academic_year_id: string
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["school_level"]
          name: string
          teacher_id: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["school_level"]
          name: string
          teacher_id: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["school_level"]
          name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          academic_year_id: string
          archived_at: string | null
          created_at: string | null
          grade_id: string | null
          id: string
          max_students: number | null
          name: string
          price_monthly: number | null
          price_per_session: number | null
          pricing: Database["public"]["Enums"]["pricing_type"]
          schedule: Json | null
          subject_id: string | null
          teacher_id: string
        }
        Insert: {
          academic_year_id: string
          archived_at?: string | null
          created_at?: string | null
          grade_id?: string | null
          id?: string
          max_students?: number | null
          name: string
          price_monthly?: number | null
          price_per_session?: number | null
          pricing?: Database["public"]["Enums"]["pricing_type"]
          schedule?: Json | null
          subject_id?: string | null
          teacher_id: string
        }
        Update: {
          academic_year_id?: string
          archived_at?: string | null
          created_at?: string | null
          grade_id?: string | null
          id?: string
          max_students?: number | null
          name?: string
          price_monthly?: number | null
          price_per_session?: number | null
          pricing?: Database["public"]["Enums"]["pricing_type"]
          schedule?: Json | null
          subject_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          items: Json
          notes: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          teacher_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          items?: Json
          notes?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          teacher_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          items?: Json
          notes?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string | null
          id: string
          read_by: string[]
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          target_ids: string[]
          target_type: Database["public"]["Enums"]["notification_target"]
          teacher_id: string
          title: string
        }
        Insert: {
          body: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          id?: string
          read_by?: string[]
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          target_ids?: string[]
          target_type: Database["public"]["Enums"]["notification_target"]
          teacher_id: string
          title: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          id?: string
          read_by?: string[]
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          target_ids?: string[]
          target_type?: Database["public"]["Enums"]["notification_target"]
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_grades: {
        Row: {
          created_at: string | null
          exam_date: string
          exam_title: string
          id: string
          notes: string | null
          score: number
          student_id: string
          teacher_id: string
          total_marks: number
        }
        Insert: {
          created_at?: string | null
          exam_date: string
          exam_title: string
          id?: string
          notes?: string | null
          score: number
          student_id: string
          teacher_id: string
          total_marks: number
        }
        Update: {
          created_at?: string | null
          exam_date?: string
          exam_title?: string
          id?: string
          notes?: string | null
          score?: number
          student_id?: string
          teacher_id?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "offline_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offline_grades_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_students: {
        Row: {
          id: string
          parent_id: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
          teacher_id: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          consent_at: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          teacher_id: string
          user_id: string | null
        }
        Insert: {
          consent_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          teacher_id: string
          user_id?: string | null
        }
        Update: {
          consent_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          teacher_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          actor_assistant_id: string | null
          amount: number
          created_at: string | null
          created_by: string
          currency: string
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          payment_date: string
          period_from: string | null
          period_to: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          actor_assistant_id?: string | null
          amount: number
          created_at?: string | null
          created_by: string
          currency?: string
          id?: string
          invoice_id?: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date: string
          period_from?: string | null
          period_to?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          actor_assistant_id?: string | null
          amount?: number
          created_at?: string | null
          created_by?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          period_from?: string | null
          period_to?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_fk"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          bundled_addons: string[]
          created_at: string | null
          features: Json
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          price_egp: number
          student_cap: number | null
          tier: Database["public"]["Enums"]["plan_tier"]
          wa_cap_monthly: number | null
        }
        Insert: {
          bundled_addons?: string[]
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          price_egp: number
          student_cap?: number | null
          tier: Database["public"]["Enums"]["plan_tier"]
          wa_cap_monthly?: number | null
        }
        Update: {
          bundled_addons?: string[]
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          price_egp?: number
          student_cap?: number | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          wa_cap_monthly?: number | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          teacher_id: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          teacher_id: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          teacher_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: Json | null
          exam_id: string
          id: string
          marks: number
          options: Json | null
          order_index: number
          question_image_url: string | null
          question_text: string
          teacher_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          correct_answer?: Json | null
          exam_id: string
          id?: string
          marks?: number
          options?: Json | null
          order_index?: number
          question_image_url?: string | null
          question_text: string
          teacher_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          correct_answer?: Json | null
          exam_id?: string
          id?: string
          marks?: number
          options?: Json | null
          order_index?: number
          question_image_url?: string | null
          question_text?: string
          teacher_id?: string
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number
          group_id: string | null
          id: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["session_status"]
          student_id: string | null
          teacher_id: string
          title: string | null
          type: Database["public"]["Enums"]["session_type"]
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number
          group_id?: string | null
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id?: string | null
          teacher_id: string
          title?: string | null
          type?: Database["public"]["Enums"]["session_type"]
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          group_id?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id?: string | null
          teacher_id?: string
          title?: string | null
          type?: Database["public"]["Enums"]["session_type"]
        }
        Relationships: [
          {
            foreignKeyName: "sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_faqs: {
        Row: {
          answer: string
          id: string
          is_active: boolean
          order_index: number
          question: string
        }
        Insert: {
          answer: string
          id?: string
          is_active?: boolean
          order_index?: number
          question: string
        }
        Update: {
          answer?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question?: string
        }
        Relationships: []
      }
      site_features: {
        Row: {
          created_at: string | null
          cta_href: string | null
          cta_label: string | null
          examples: Json | null
          faq: Json | null
          hero_subtitle: string | null
          highlights: Json | null
          icon: string
          id: string
          is_active: boolean
          is_primary: boolean
          long_body: string | null
          order_index: number
          seo_desc: string | null
          seo_title: string | null
          short_body: string
          slug: string
          title: string
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_href?: string | null
          cta_label?: string | null
          examples?: Json | null
          faq?: Json | null
          hero_subtitle?: string | null
          highlights?: Json | null
          icon: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          long_body?: string | null
          order_index?: number
          seo_desc?: string | null
          seo_title?: string | null
          short_body: string
          slug: string
          title: string
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_href?: string | null
          cta_label?: string | null
          examples?: Json | null
          faq?: Json | null
          hero_subtitle?: string | null
          highlights?: Json | null
          icon?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          long_body?: string | null
          order_index?: number
          seo_desc?: string | null
          seo_title?: string | null
          short_body?: string
          slug?: string
          title?: string
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_hero_slides: {
        Row: {
          badge: string | null
          bg_gradient: string | null
          created_at: string | null
          cta_href: string | null
          cta_label: string | null
          highlight: string | null
          id: string
          image_url: string | null
          is_active: boolean
          order_index: number
          subtitle: string | null
          title: string
        }
        Insert: {
          badge?: string | null
          bg_gradient?: string | null
          created_at?: string | null
          cta_href?: string | null
          cta_label?: string | null
          highlight?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          badge?: string | null
          bg_gradient?: string | null
          created_at?: string | null
          cta_href?: string | null
          cta_label?: string | null
          highlight?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          body: string
          created_at: string | null
          hero_kicker: string | null
          id: string
          is_published: boolean
          seo_desc: string | null
          seo_title: string | null
          show_in_nav: boolean
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: string
          created_at?: string | null
          hero_kicker?: string | null
          id?: string
          is_published?: boolean
          seo_desc?: string | null
          seo_title?: string | null
          show_in_nav?: boolean
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          hero_kicker?: string | null
          id?: string
          is_published?: boolean
          seo_desc?: string | null
          seo_title?: string | null
          show_in_nav?: boolean
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          id: string
          is_active: boolean
          label: string
          order_index: number
          source: string | null
          suffix: string | null
          value: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          label: string
          order_index?: number
          source?: string | null
          suffix?: string | null
          value: number
        }
        Update: {
          id?: string
          is_active?: boolean
          label?: string
          order_index?: number
          source?: string | null
          suffix?: string | null
          value?: number
        }
        Relationships: []
      }
      site_testimonials: {
        Row: {
          avatar_url: string | null
          body: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
          rating: number
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          body: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          rating?: number
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          body?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          rating?: number
          role?: string | null
        }
        Relationships: []
      }
      student_groups: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          left_at: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_groups_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_groups_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          archived_at: string | null
          created_at: string | null
          custom_fields: Json
          date_of_birth: string | null
          id: string
          name_ar: string
          name_en: string | null
          notes: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          photo_url: string | null
          teacher_id: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          custom_fields?: Json
          date_of_birth?: string | null
          id?: string
          name_ar: string
          name_en?: string | null
          notes?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          photo_url?: string | null
          teacher_id: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          custom_fields?: Json
          date_of_birth?: string | null
          id?: string
          name_ar?: string
          name_en?: string | null
          notes?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          photo_url?: string | null
          teacher_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name_ar: string
          name_en: string | null
          teacher_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name_ar: string
          name_en?: string | null
          teacher_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name_ar?: string
          name_en?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_paid_egp: number | null
          confirmed_by: string | null
          created_at: string | null
          ends_at: string
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          teacher_id: string
        }
        Insert: {
          amount_paid_egp?: number | null
          confirmed_by?: string | null
          created_at?: string | null
          ends_at: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          teacher_id: string
        }
        Update: {
          amount_paid_egp?: number | null
          confirmed_by?: string | null
          created_at?: string | null
          ends_at?: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_addons: {
        Row: {
          active_from: string
          active_until: string | null
          addon_id: string
          created_at: string | null
          granted_by: string | null
          id: string
          notes: string | null
          teacher_id: string
        }
        Insert: {
          active_from?: string
          active_until?: string | null
          addon_id: string
          created_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          teacher_id: string
        }
        Update: {
          active_from?: string
          active_until?: string | null
          addon_id?: string
          created_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_addons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_plan_id: string | null
          current_status: Database["public"]["Enums"]["subscription_status"]
          custom_domain: string | null
          email: string
          id: string
          locale: string
          name_ar: string
          name_en: string | null
          onboarded_at: string | null
          phone: string | null
          settings: Json
          subdomain: string | null
          timezone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_plan_id?: string | null
          current_status?: Database["public"]["Enums"]["subscription_status"]
          custom_domain?: string | null
          email: string
          id?: string
          locale?: string
          name_ar: string
          name_en?: string | null
          onboarded_at?: string | null
          phone?: string | null
          settings?: Json
          subdomain?: string | null
          timezone?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_plan_id?: string | null
          current_status?: Database["public"]["Enums"]["subscription_status"]
          custom_domain?: string | null
          email?: string
          id?: string
          locale?: string
          name_ar?: string
          name_en?: string | null
          onboarded_at?: string | null
          phone?: string | null
          settings?: Json
          subdomain?: string | null
          timezone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_send_log: {
        Row: {
          id: string
          recipient_phone: string
          sent_at: string | null
          teacher_id: string
          template: string | null
        }
        Insert: {
          id?: string
          recipient_phone: string
          sent_at?: string | null
          teacher_id: string
          template?: string | null
        }
        Update: {
          id?: string
          recipient_phone?: string
          sent_at?: string | null
          teacher_id?: string
          template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_send_log_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_custom_claims: { Args: { event: Json }; Returns: Json }
      expand_recurring_sessions: {
        Args: { p_horizon_days?: number; p_teacher_id: string }
        Returns: number
      }
      is_self_student: { Args: { p_student_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      my_student_group_ids: { Args: never; Returns: string[] }
      my_student_ids: { Args: never; Returns: string[] }
      my_student_teacher_ids: { Args: never; Returns: string[] }
      my_teacher_id: { Args: never; Returns: string }
      overdue_students_for_today: {
        Args: { p_today?: string }
        Returns: {
          amount_due: number
          group_id: string
          group_name: string
          last_period_to: string
          name_ar: string
          parent_phone: string
          student_id: string
        }[]
      }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late" | "excused"
      cms_page_type:
        | "home"
        | "about"
        | "contact"
        | "gallery"
        | "blog"
        | "custom"
      exam_status: "draft" | "published" | "closed"
      exam_visibility: "groups" | "grades" | "all"
      invoice_status: "draft" | "issued" | "paid" | "cancelled"
      notification_channel: "in_app" | "push" | "whatsapp" | "email"
      notification_status: "pending" | "sent" | "failed"
      notification_target: "student" | "group" | "grade" | "parent" | "all"
      payment_method: "cash" | "bank_transfer" | "wallet" | "other"
      plan_tier: "free" | "basic" | "pro" | "premium"
      pricing_type: "per_session" | "monthly"
      question_type:
        | "mcq"
        | "true_false"
        | "fill_blank"
        | "short_answer"
        | "essay"
        | "image_upload"
      school_level: "primary" | "preparatory" | "secondary"
      session_status: "scheduled" | "completed" | "cancelled"
      session_type: "recurring" | "custom" | "makeup"
      subscription_status: "trial" | "active" | "frozen" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: ["present", "absent", "late", "excused"],
      cms_page_type: ["home", "about", "contact", "gallery", "blog", "custom"],
      exam_status: ["draft", "published", "closed"],
      exam_visibility: ["groups", "grades", "all"],
      invoice_status: ["draft", "issued", "paid", "cancelled"],
      notification_channel: ["in_app", "push", "whatsapp", "email"],
      notification_status: ["pending", "sent", "failed"],
      notification_target: ["student", "group", "grade", "parent", "all"],
      payment_method: ["cash", "bank_transfer", "wallet", "other"],
      plan_tier: ["free", "basic", "pro", "premium"],
      pricing_type: ["per_session", "monthly"],
      question_type: [
        "mcq",
        "true_false",
        "fill_blank",
        "short_answer",
        "essay",
        "image_upload",
      ],
      school_level: ["primary", "preparatory", "secondary"],
      session_status: ["scheduled", "completed", "cancelled"],
      session_type: ["recurring", "custom", "makeup"],
      subscription_status: ["trial", "active", "frozen", "archived"],
    },
  },
} as const
