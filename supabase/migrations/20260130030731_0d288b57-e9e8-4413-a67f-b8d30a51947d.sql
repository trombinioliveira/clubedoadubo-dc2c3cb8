-- Add is_blocked column to profiles table for blocking users on declined purchases
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;

-- Add blocked_at timestamp to track when the user was blocked
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add blocked_reason to store why the user was blocked
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked_reason TEXT DEFAULT NULL;

-- Create index for faster lookups of blocked users
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked) WHERE is_blocked = true;

-- Create index on external_transaction_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_external_transaction_id ON public.profiles(external_transaction_id) WHERE external_transaction_id IS NOT NULL;