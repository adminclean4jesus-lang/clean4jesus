export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CommunityPostKind = "prayer" | "testimony" | "update";
export type CommunityContentStatus = "published" | "hidden";
export type CommunityReportReason = "spam" | "harassment" | "sexual_content" | "self_harm" | "other";
export type CommunityReportStatus = "pending" | "reviewed" | "resolved";

export type Database = {
  public: {
    Tables: {
      runtime_gates: {
        Row: {
          hard_block: boolean;
          message: string;
          minimum_supported_version: string;
          platform: "android" | "ios";
          recommended_version: string;
          title: string;
          update_url: string | null;
          updated_at: string;
        };
        Insert: {
          hard_block?: boolean;
          message: string;
          minimum_supported_version: string;
          platform: "android" | "ios";
          recommended_version: string;
          title: string;
          update_url?: string | null;
          updated_at?: string;
        };
        Update: {
          hard_block?: boolean;
          message?: string;
          minimum_supported_version?: string;
          recommended_version?: string;
          title?: string;
          update_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          clean_streak: number;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          clean_streak?: number;
          created_at?: string;
          display_name: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          clean_streak?: number;
          display_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      community_posts: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          kind: CommunityPostKind;
          status: CommunityContentStatus;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          kind: CommunityPostKind;
          status?: CommunityContentStatus;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          kind?: CommunityPostKind;
          status?: CommunityContentStatus;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      community_prayers: {
        Row: { created_at: string; post_id: string; user_id: string };
        Insert: { created_at?: string; post_id: string; user_id: string };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "community_prayers_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_prayers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      community_comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          post_id: string;
          status: CommunityContentStatus;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          post_id: string;
          status?: CommunityContentStatus;
          updated_at?: string;
        };
        Update: { body?: string; status?: CommunityContentStatus; updated_at?: string };
        Relationships: [
          {
            foreignKeyName: "community_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      community_reports: {
        Row: {
          comment_id: string | null;
          created_at: string;
          details: string | null;
          id: string;
          post_id: string | null;
          reason: CommunityReportReason;
          reporter_id: string | null;
          status: CommunityReportStatus;
        };
        Insert: {
          comment_id?: string | null;
          created_at?: string;
          details?: string | null;
          id?: string;
          post_id?: string | null;
          reason: CommunityReportReason;
          reporter_id: string;
          status?: CommunityReportStatus;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "community_reports_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "community_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_reports_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_current_legal_consent: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      record_legal_consent: {
        Args: { requested_locale: string; requested_source: string };
        Returns: undefined;
      };
      get_devotional_plan_catalog: {
        Args: { p_limit?: number; p_locale?: string; p_offset?: number };
        Returns: Json;
      };
      get_devotional_plan_detail: {
        Args: { p_locale?: string; p_plan_id: string };
        Returns: Json;
      };
      get_published_devotional_catalog: {
        Args: { p_limit?: number; p_locale?: string; p_offset?: number };
        Returns: Json;
      };
      get_daily_devotional: {
        Args: { p_locale?: string; p_on_date?: string };
        Returns: Json;
      };
      get_community_engagement: {
        Args: { p_post_ids: string[] };
        Returns: {
          comment_count: number;
          post_id: string;
          prayed_by_me: boolean;
          prayer_count: number;
        }[];
      };
      list_community_comments_public: {
        Args: { p_post_id: string };
        Returns: {
          author_avatar_url: string | null;
          author_display_name: string;
          body: string;
          created_at: string;
          id: string;
          owned_by_me: boolean;
        }[];
      };
      list_community_posts_public: {
        Args: { p_kind?: CommunityPostKind | null };
        Returns: {
          author_avatar_url: string | null;
          author_city: string | null;
          author_display_name: string;
          body: string;
          created_at: string;
          id: string;
          kind: CommunityPostKind;
          owned_by_me: boolean;
          title: string;
        }[];
      };
    };
    Enums: {
      community_content_status: CommunityContentStatus;
      community_post_kind: CommunityPostKind;
      community_report_reason: CommunityReportReason;
      community_report_status: CommunityReportStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
