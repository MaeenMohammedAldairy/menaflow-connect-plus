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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      client_members: {
        Row: {
          client_id: string
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          permissions: Json
          role: Database["public"]["Enums"]["client_role"]
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["client_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["client_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          country: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          locale: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json
          slug: string | null
          timezone: string
          updated_at: string
          website: string | null
        }
        Insert: {
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          locale?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json
          slug?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          locale?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json
          slug?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_secrets: {
        Row: {
          access_token: string | null
          client_id: string
          connection_id: string
          updated_at: string
          webhook_token: string | null
        }
        Insert: {
          access_token?: string | null
          client_id: string
          connection_id: string
          updated_at?: string
          webhook_token?: string | null
        }
        Update: {
          access_token?: string | null
          client_id?: string
          connection_id?: string
          updated_at?: string
          webhook_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_secrets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_secrets_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          client_id: string
          created_at: string
          email: string | null
          external_id: string | null
          id: string
          metadata: Json
          name: string | null
          notes: string | null
          phone: string | null
          platform: Database["public"]["Enums"]["platform_name"] | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id: string
          created_at?: string
          email?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          name?: string | null
          notes?: string | null
          phone?: string | null
          platform?: Database["public"]["Enums"]["platform_name"] | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string
          created_at?: string
          email?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          name?: string | null
          notes?: string | null
          phone?: string | null
          platform?: Database["public"]["Enums"]["platform_name"] | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          category: string
          client_id: string | null
          created_at: string
          currency: string
          description: string
          id: string
          image_url: string | null
          platforms: string[]
          price: number
          status: Database["public"]["Enums"]["review_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          image_url?: string | null
          platforms?: string[]
          price?: number
          status?: Database["public"]["Enums"]["review_status"]
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          image_url?: string | null
          platforms?: string[]
          price?: number
          status?: Database["public"]["Enums"]["review_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_paused: boolean
          ai_reply_count: number
          assigned_to: string | null
          away_sent_at: string | null
          client_id: string
          contact_id: string | null
          created_at: string
          external_thread_id: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          metadata: Json
          platform: Database["public"]["Enums"]["platform_name"]
          status: string
          subject: string | null
          unread_count: number
          updated_at: string
        }
        Insert: {
          ai_paused?: boolean
          ai_reply_count?: number
          assigned_to?: string | null
          away_sent_at?: string | null
          client_id: string
          contact_id?: string | null
          created_at?: string
          external_thread_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json
          platform: Database["public"]["Enums"]["platform_name"]
          status?: string
          subject?: string | null
          unread_count?: number
          updated_at?: string
        }
        Update: {
          ai_paused?: boolean
          ai_reply_count?: number
          assigned_to?: string | null
          away_sent_at?: string | null
          client_id?: string
          contact_id?: string | null
          created_at?: string
          external_thread_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json
          platform?: Database["public"]["Enums"]["platform_name"]
          status?: string
          subject?: string | null
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          client_id: string
          created_at: string
          id: string
          location: string
          product_id: string
          quantity: number
          reorder_point: number
          reserved: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          location?: string
          product_id: string
          quantity?: number
          reorder_point?: number
          reserved?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          location?: string
          product_id?: string
          quantity?: number
          reorder_point?: number
          reserved?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          metadata: Json
          position: number
          source_id: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json
          position?: number
          source_id: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          position?: number
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          client_id: string
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          metadata: Json
          source_type: string
          status: string
          storage_path: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          source_type?: string
          status?: string
          storage_path?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          source_type?: string
          status?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          client_id: string
          content_type: string
          conversation_id: string
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          error: string | null
          external_message_id: string | null
          id: string
          media_mime: string | null
          media_url: string | null
          payload: Json
          platform: Database["public"]["Enums"]["platform_name"]
          sender_id: string | null
          sender_type: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          body?: string | null
          client_id: string
          content_type?: string
          conversation_id: string
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          error?: string | null
          external_message_id?: string | null
          id?: string
          media_mime?: string | null
          media_url?: string | null
          payload?: Json
          platform: Database["public"]["Enums"]["platform_name"]
          sender_id?: string | null
          sender_type?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          body?: string | null
          client_id?: string
          content_type?: string
          conversation_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          error?: string | null
          external_message_id?: string | null
          id?: string
          media_mime?: string | null
          media_url?: string | null
          payload?: Json
          platform?: Database["public"]["Enums"]["platform_name"]
          sender_id?: string | null
          sender_type?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          client_id: string
          created_at: string
          platform: Database["public"]["Enums"]["platform_name"]
          redirect_uri: string
          return_origin: string
          state: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          platform: Database["public"]["Enums"]["platform_name"]
          redirect_uri: string
          return_origin: string
          state: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          platform?: Database["public"]["Enums"]["platform_name"]
          redirect_uri?: string
          return_origin?: string
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_states_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          client_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          order_id: string
          product_id?: string | null
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          currency: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          placed_at: string | null
          shipping: number
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          client_id: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string | null
          shipping?: number
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string | null
          shipping?: number
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          account_name: string
          client_id: string
          created_at: string
          error: string | null
          id: string
          instance_name: string | null
          metadata: Json
          page_id: string | null
          pairing_code: string | null
          pairing_phone: string | null
          phone_number: string | null
          platform: Database["public"]["Enums"]["platform_name"]
          provider_account_id: string
          qr_code: string | null
          qr_expires_at: string | null
          revoked_at: string | null
          status: Database["public"]["Enums"]["connection_status"]
          token_expires_at: string | null
          token_ref: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          account_name?: string
          client_id: string
          created_at?: string
          error?: string | null
          id?: string
          instance_name?: string | null
          metadata?: Json
          page_id?: string | null
          pairing_code?: string | null
          pairing_phone?: string | null
          phone_number?: string | null
          platform: Database["public"]["Enums"]["platform_name"]
          provider_account_id?: string
          qr_code?: string | null
          qr_expires_at?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_expires_at?: string | null
          token_ref?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          account_name?: string
          client_id?: string
          created_at?: string
          error?: string | null
          id?: string
          instance_name?: string | null
          metadata?: Json
          page_id?: string | null
          pairing_code?: string | null
          pairing_phone?: string | null
          phone_number?: string | null
          platform?: Database["public"]["Enums"]["platform_name"]
          provider_account_id?: string
          qr_code?: string | null
          qr_expires_at?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_expires_at?: string | null
          token_ref?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_connections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          client_id: string
          created_at: string
          height: number | null
          id: string
          is_primary: boolean
          position: number
          product_id: string
          storage_path: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          client_id: string
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id: string
          storage_path?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          client_id?: string
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id?: string
          storage_path?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string | null
          client_id: string
          compare_at_price: number | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          is_featured: boolean
          metadata: Json
          name: string
          price: number
          sku: string | null
          slug: string | null
          status: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          client_id: string
          compare_at_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          metadata?: Json
          name: string
          price?: number
          sku?: string | null
          slug?: string | null
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category?: string | null
          client_id?: string
          compare_at_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          metadata?: Json
          name?: string
          price?: number
          sku?: string | null
          slug?: string | null
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          locale: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission: string
          role: Database["public"]["Enums"]["client_role"]
        }
        Insert: {
          permission: string
          role: Database["public"]["Enums"]["client_role"]
        }
        Update: {
          permission?: string
          role?: Database["public"]["Enums"]["client_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_publish: boolean
          display_name: string
          locale: string
          notifications: boolean
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_publish?: boolean
          display_name?: string
          locale?: string
          notifications?: boolean
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_publish?: boolean
          display_name?: string
          locale?: string
          notifications?: boolean
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          client_id: string | null
          error: string | null
          event_type: string
          external_id: string | null
          id: string
          payload: Json
          platform: Database["public"]["Enums"]["platform_name"] | null
          processed_at: string | null
          received_at: string
          status: Database["public"]["Enums"]["webhook_status"]
        }
        Insert: {
          client_id?: string | null
          error?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          payload?: Json
          platform?: Database["public"]["Enums"]["platform_name"] | null
          processed_at?: string | null
          received_at?: string
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Update: {
          client_id?: string | null
          error?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          payload?: Json
          platform?: Database["public"]["Enums"]["platform_name"] | null
          processed_at?: string | null
          received_at?: string
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notifications: {
        Row: {
          id: string
          client_id: string
          platform: Database["public"]["Enums"]["platform_name"]
          kind: string
          title: string
          body: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          platform: Database["public"]["Enums"]["platform_name"]
          kind: string
          title: string
          body?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          platform?: Database["public"]["Enums"]["platform_name"]
          kind?: string
          title?: string
          body?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          client_id: string
          ai_enabled: boolean
          ai_tone: string
          ai_language: string
          ai_instructions: string
          ai_reply_mode: string
          handoff_keywords: string[]
          handoff_message: string
          max_ai_replies: number
          hours_enabled: boolean
          timezone: string
          business_hours: Json
          outside_hours_message: string
          welcome_enabled: boolean
          welcome_message: string
          unavailable_message: string
          closing_message: string
          ignore_groups: boolean
          read_messages: boolean
          reject_calls: boolean
          notify_new_message: boolean
          notify_disconnect: boolean
          notify_errors: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          ai_enabled?: boolean
          ai_tone?: string
          ai_language?: string
          ai_instructions?: string
          ai_reply_mode?: string
          handoff_keywords?: string[]
          handoff_message?: string
          max_ai_replies?: number
          hours_enabled?: boolean
          timezone?: string
          business_hours?: Json
          outside_hours_message?: string
          welcome_enabled?: boolean
          welcome_message?: string
          unavailable_message?: string
          closing_message?: string
          ignore_groups?: boolean
          read_messages?: boolean
          reject_calls?: boolean
          notify_new_message?: boolean
          notify_disconnect?: boolean
          notify_errors?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          ai_enabled?: boolean
          ai_tone?: string
          ai_language?: string
          ai_instructions?: string
          ai_reply_mode?: string
          handoff_keywords?: string[]
          handoff_message?: string
          max_ai_replies?: number
          hours_enabled?: boolean
          timezone?: string
          business_hours?: Json
          outside_hours_message?: string
          welcome_enabled?: boolean
          welcome_message?: string
          unavailable_message?: string
          closing_message?: string
          ignore_groups?: boolean
          read_messages?: boolean
          reject_calls?: boolean
          notify_new_message?: boolean
          notify_disconnect?: boolean
          notify_errors?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_client_role: {
        Args: {
          p_client_id: string
          p_roles: Database["public"]["Enums"]["client_role"][]
        }
        Returns: boolean
      }
      is_client_member: { Args: { p_client_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      shares_client_with: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      client_role: "owner" | "admin" | "agent" | "viewer"
      connection_status: "pending" | "connected" | "disconnected" | "error"
      member_status: "invited" | "active" | "suspended"
      message_direction: "inbound" | "outbound"
      message_status: "queued" | "sent" | "delivered" | "read" | "failed"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "unpaid" | "paid" | "refunded"
      platform_name: "whatsapp" | "facebook" | "instagram"
      review_status: "draft" | "approved" | "rejected"
      webhook_status: "received" | "processed" | "failed" | "ignored"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff", "user"],
      client_role: ["owner", "admin", "agent", "viewer"],
      connection_status: ["pending", "connected", "disconnected", "error"],
      member_status: ["invited", "active", "suspended"],
      message_direction: ["inbound", "outbound"],
      message_status: ["queued", "sent", "delivered", "read", "failed"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["unpaid", "paid", "refunded"],
      platform_name: ["whatsapp", "facebook", "instagram"],
      review_status: ["draft", "approved", "rejected"],
      webhook_status: ["received", "processed", "failed", "ignored"],
    },
  },
} as const
