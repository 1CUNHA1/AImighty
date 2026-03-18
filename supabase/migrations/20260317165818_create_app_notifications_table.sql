-- Create app_notifications table
CREATE TABLE app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own notifications"
    ON app_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (e.g. mark as read)"
    ON app_notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON app_notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Also allow insert for the authenticated user, though Edge Function can bypass this with service role
CREATE POLICY "Users can insert their own notifications"
    ON app_notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add notification preference to profiles if not present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences BOOLEAN DEFAULT TRUE;
