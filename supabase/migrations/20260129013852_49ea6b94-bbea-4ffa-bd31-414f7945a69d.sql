-- Add 'pending' status to pro_status enum for PROs that haven't been collected yet
ALTER TYPE pro_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'processing';