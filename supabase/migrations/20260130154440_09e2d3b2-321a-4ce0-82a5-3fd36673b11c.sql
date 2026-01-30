
-- Clean all FIFO-related data, keeping only users/profiles
DELETE FROM financial_entries;
DELETE FROM distributions;
DELETE FROM fifo_queue;
DELETE FROM weighings;
DELETE FROM pros;
DELETE FROM batches;
