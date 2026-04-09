-- Fix Daniel's referral link to Hugo
UPDATE profiles 
SET referred_by = '62f21c5c-6a7e-4899-8f54-b0bac0bc66a2'
WHERE id = '1a612d64-1388-48f2-b525-a46ecfbdc719' 
AND referred_by IS NULL;