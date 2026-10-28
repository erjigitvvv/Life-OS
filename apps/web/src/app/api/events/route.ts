import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id = 'default_user', event_type, event_category, title, description, context = {}, metadata = {}, source = 'web' } = body;

    // If Supabase is connected and credentials are provided, persist event directly into Supabase DB
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('events').insert({
          user_id,
          event_type: event_type || 'system_event',
          event_category: event_category || 'general',
          title: title || 'Activity Event',
          description: description || '',
          context,
          metadata,
          source,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.warn('[Supabase Event Insert Warning]:', error.message);
        }
      } catch (err) {
        console.warn('[Supabase Sync Error]:', err);
      }
    }

    // Always respond 200 OK cleanly
    return NextResponse.json({
      success: true,
      syncedToSupabase: isSupabaseConfigured,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to process event' }, { status: 400 });
  }
}
