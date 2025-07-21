import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MarginCalculatorProps {
  title: string;
  sellPrice: string;
  costPrice: string;
  onSellPriceChange: (value: string) => void;
  onCostPriceChange: (value: string) => void;
  taxRate?: string;
  className?: string;
}

export default function MarginCalculator({
  title,
  sellPrice,
  costPrice,
  onSellPriceChange,
  onCostPriceChange,
  taxRate = '10',
  className = ''
}: MarginCalculatorProps) {
  const [includeGST, setIncludeGST] = useState(true);
  const [sellPriceExcl, setSellPriceExcl] = useState(0);
  const [sellPriceIncl, setSellPriceIncl] = useState(0);
  const [netCostExcl, setNetCostExcl] = useState(0);
  const [netCostIncl, setNetCostIncl] = useState(0);
  const [grossMargin, setGrossMargin] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [grossProfitExcl, setGrossProfitExcl] = useState(0);

  const round = (n: number) => Math.round(n * 100) / 100;

  useEffect(() => {
    const gstRate = parseFloat(taxRate || '0') / 100;
    const sellIncl = parseFloat(sellPrice || '0') || 0;
    const costIncl = parseFloat(costPrice || '0') || 0;

    const sellExcl = sellIncl / (1 + gstRate);
    const costExcl = costIncl / (1 + gstRate);

    setSellPriceIncl(round(sellIncl));
    setSellPriceExcl(round(sellExcl));
    setNetCostIncl(round(costIncl));
    setNetCostExcl(round(costExcl));

    const profit = sellExcl - costExcl;
    const marginPct = sellExcl > 0 ? (profit / sellExcl) * 100 : 0;
    const markupPct = costExcl > 0 ? (profit / costExcl) * 100 : 0;

    setGrossProfitExcl(round(profit));
    setGrossMargin(round(marginPct));
    setMarkup(round(markupPct));
  }, [sellPrice, costPrice, taxRate]);

  const updateSellFromExcl = (sellExcl: number) => {
    const gstRate = parseFloat(taxRate || '0') / 100;
    setSellPriceExcl(round(sellExcl));
    setSellPriceIncl(round(sellExcl * (1 + gstRate)));
    onSellPriceChange((sellExcl * (1 + gstRate)).toFixed(2));
  };

  const handleSellPriceChange = (value: string) => {
    const num = parseFloat(value || '0');
    const gstRate = parseFloat(taxRate || '0') / 100;
    if (includeGST) {
      updateSellFromExcl(num / (1 + gstRate));
    } else {
      updateSellFromExcl(num);
    }
  };

  const handleNetCostChange = (value: string) => {
    const num = parseFloat(value || '0');
    const gstRate = parseFloat(taxRate || '0') / 100;
    if (includeGST) {
      setNetCostIncl(round(num));
      setNetCostExcl(round(num / (1 + gstRate)));
      onCostPriceChange(num.toFixed(2));
    } else {
      setNetCostExcl(round(num));
      setNetCostIncl(round(num * (1 + gstRate)));
      onCostPriceChange((num * (1 + gstRate)).toFixed(2));
    }
  };

  const handleGrossMarginChange = (value: string) => {
    const marginPercent = parseFloat(value || '0');
    if (netCostExcl > 0 && marginPercent >= 0) {
      const newSellExcl = netCostExcl / (1 - marginPercent / 100);
      updateSellFromExcl(newSellExcl);
    }
  };

  const handleMarkupChange = (value: string) => {
    const markupPercent = parseFloat(value || '0');
    if (netCostExcl > 0 && markupPercent >= 0) {
      const newSellExcl = netCostExcl * (1 + markupPercent / 100);
      updateSellFromExcl(newSellExcl);
    }
  };

  const handleGrossProfitChange = (value: string) => {
    const profitInput = parseFloat(value || '0');
    const gstRate = parseFloat(taxRate || '0') / 100;
    const profitExcl = includeGST ? profitInput / (1 + gstRate) : profitInput;
    const newSellExcl = netCostExcl + profitExcl;
    updateSellFromExcl(newSellExcl);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{`${title} (${includeGST ? 'inc' : 'exc'})`}</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="gst-toggle"
              checked={includeGST}
              onCheckedChange={setIncludeGST}
            />
            <Label htmlFor="gst-toggle" className="text-sm">
              Include GST ({taxRate}%)
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Sell Price ({includeGST ? 'incl. GST' : 'excl. GST'})</div>
            <div className="relative">
              <span className="absolute left-2 top-1.5">$</span>
              <Input
                type="number"
                step="0.01"
                value={includeGST ? sellPriceIncl : sellPriceExcl}
                onChange={(e) => handleSellPriceChange(e.target.value)}
                className="pl-5 text-center"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Net Cost ({includeGST ? 'incl.' : 'exc.'})</div>
            <div className="relative">
              <span className="absolute left-2 top-1.5">$</span>
              <Input
                type="number"
                step="0.01"
                value={includeGST ? netCostIncl : netCostExcl}
                onChange={(e) => handleNetCostChange(e.target.value)}
                className="pl-5 text-center"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Gross Margin %</div>
            <Input
              type="number"
              step="0.01"
              value={grossMargin}
              onChange={(e) => handleGrossMarginChange(e.target.value)}
              className="text-center"
              placeholder="0.00"
            />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Markup %</div>
            <Input
              type="number"
              step="0.01"
              value={markup}
              onChange={(e) => handleMarkupChange(e.target.value)}
              className="text-center"
              placeholder="0.00"
            />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Gross Profit ({includeGST ? 'incl.' : 'exc.'})</div>
            <div className="relative">
              <span className="absolute left-2 top-1.5">$</span>
              <Input
                type="number"
                step="0.01"
                value={includeGST ? round(grossProfitExcl * (1 + parseFloat(taxRate) / 100)) : grossProfitExcl}
                onChange={(e) => handleGrossProfitChange(e.target.value)}
                className="pl-5 text-center"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        
        {/* Display current input values for reference */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              Current Sell Price: ${sellPrice} ({includeGST ? 'incl.' : 'excl.'} GST)
            </div>
            <div>
              Current Net Cost: ${costPrice} ({includeGST ? 'incl.' : 'excl.'} GST)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 