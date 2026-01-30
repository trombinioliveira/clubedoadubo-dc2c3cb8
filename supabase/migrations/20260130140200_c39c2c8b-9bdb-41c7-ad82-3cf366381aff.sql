-- =====================================================
-- SALES POINTS (Pontos de Venda) - for distribution
-- =====================================================
CREATE TABLE public.sales_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  contact_name TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.sales_points ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales_points (admin/staff only)
CREATE POLICY "Admins and staff can view sales points" 
ON public.sales_points FOR SELECT 
USING (public.is_admin(auth.uid()) OR public.is_staff(auth.uid()));

CREATE POLICY "Admins and staff can insert sales points" 
ON public.sales_points FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()) OR public.is_staff(auth.uid()));

CREATE POLICY "Admins and staff can update sales points" 
ON public.sales_points FOR UPDATE 
USING (public.is_admin(auth.uid()) OR public.is_staff(auth.uid()));

CREATE POLICY "Admins can delete sales points" 
ON public.sales_points FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_sales_points_updated_at
  BEFORE UPDATE ON public.sales_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- DISTRIBUTIONS (Registros de distribuição para pontos de venda)
-- =====================================================
CREATE TABLE public.distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_point_id UUID REFERENCES public.sales_points(id) ON DELETE CASCADE,
  
  -- Product quantities
  granulated_packages INTEGER DEFAULT 0,
  granulated_kg_per_package DECIMAL(10,2) DEFAULT 0,
  liquid_bottles INTEGER DEFAULT 0,
  liquid_liters_per_bottle DECIMAL(10,2) DEFAULT 0,
  
  -- Other items
  other_items TEXT,
  observations TEXT,
  
  -- Dates
  distributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  pros_moved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

-- RLS policies for distributions
CREATE POLICY "Admins and staff can view distributions" 
ON public.distributions FOR SELECT 
USING (public.is_admin(auth.uid()) OR public.is_staff(auth.uid()));

CREATE POLICY "Admins and staff can insert distributions" 
ON public.distributions FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()) OR public.is_staff(auth.uid()));

CREATE POLICY "Admins and staff can update distributions" 
ON public.distributions FOR UPDATE 
USING (public.is_admin(auth.uid()) OR public.is_staff(auth.uid()));

CREATE POLICY "Admins can delete distributions" 
ON public.distributions FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_distributions_updated_at
  BEFORE UPDATE ON public.distributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FINANCIAL ENTRIES (Entradas financeiras)
-- =====================================================
CREATE TABLE public.financial_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Net amount received
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  
  -- Status and distribution
  is_distributed BOOLEAN NOT NULL DEFAULT false,
  distributed_at TIMESTAMP WITH TIME ZONE,
  pros_paid INTEGER DEFAULT 0,
  
  -- Metadata
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_entries (admin only)
CREATE POLICY "Admins can view financial entries" 
ON public.financial_entries FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert financial entries" 
ON public.financial_entries FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update financial entries" 
ON public.financial_entries FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete financial entries" 
ON public.financial_entries FOR DELETE 
USING (public.is_admin(auth.uid()));