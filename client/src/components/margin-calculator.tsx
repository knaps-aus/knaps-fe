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
  const [grossMargin, setGrossMargin] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [grossProfitExcl, setGrossProfitExcl] = useState(0);

  useEffect(() => {
    const sell = parseFloat(sellPrice || '0');
    const cost = parseFloat(costPrice || '0');
    const gstRate = parseFloat(taxRate || '0') / 100;

    // Calculate values based on GST toggle
    let sellExcl, sellIncl, costExcl;
    if (includeGST) {
      sellIncl = sell;
      sellExcl = sell / (1 + gstRate);
    } else {
      sellExcl = sell;
      sellIncl = sell * (1 + gstRate);
    }
    costExcl = includeGST ? (cost / (1 + gstRate)) : cost;

    // Calculate derived values
    const grossProfit = sellExcl - costExcl;
    const grossMarginPercentage = sellExcl > 0 ? (grossProfit / sellExcl) * 100 : 0;
    const markupPercentage = costExcl > 0 ? (grossProfit / costExcl) * 100 : 0;

    setSellPriceExcl(Math.round(sellExcl * 100) / 100);
    setSellPriceIncl(Math.round(sellIncl * 100) / 100);
    setNetCostExcl(Math.round(costExcl * 100) / 100);
    setGrossMargin(Math.round(grossMarginPercentage * 100) / 100);
    setMarkup(Math.round(markupPercentage * 100) / 100);
    setGrossProfitExcl(Math.round(grossProfit * 100) / 100);
  }, [sellPrice, costPrice, taxRate, includeGST]);

  // Handle changes for both inclusive and exclusive sell price
  const handleSellPriceInclChange = (value: string) => {
    const sellIncl = parseFloat(value || '0');
    const gstRate = parseFloat(taxRate || '0') / 100;
    let sellExcl = includeGST ? sellIncl / (1 + gstRate) : sellIncl;
    setSellPriceIncl(sellIncl);
    setSellPriceExcl(sellExcl);
    onSellPriceChange(sellIncl.toFixed(2));
  };

  const handleSellPriceExclChange = (value: string) => {
    const sellExcl = parseFloat(value || '0');
    const gstRate = parseFloat(taxRate || '0') / 100;
    let sellIncl = includeGST ? sellExcl * (1 + gstRate) : sellExcl;
    setSellPriceExcl(sellExcl);
    setSellPriceIncl(sellIncl);
    onSellPriceChange(sellIncl.toFixed(2));
  };

  const handleNetCostExclChange = (value: string) => {
    const costExcl = parseFloat(value || '0');
    const gstRate = parseFloat(taxRate || '0') / 100;
    
    if (includeGST) {
      // Convert exclusive to inclusive for display
      const costIncl = costExcl * (1 + gstRate);
      onCostPriceChange(costIncl.toFixed(2));
    } else {
      onCostPriceChange(costExcl.toFixed(2));
    }
  };

  const handleGrossMarginChange = (value: string) => {
    const marginPercent = parseFloat(value || '0');
    const costExcl = parseFloat(netCostExcl.toString());
    
    if (costExcl > 0 && marginPercent >= 0) {
      const newSellPriceExcl = costExcl / (1 - marginPercent / 100);
      handleSellPriceExclChange(newSellPriceExcl.toFixed(2));
    }
  };

  const handleMarkupChange = (value: string) => {
    const markupPercent = parseFloat(value || '0');
    const costExcl = parseFloat(netCostExcl.toString());
    
    if (costExcl > 0 && markupPercent >= 0) {
      const newSellPriceExcl = costExcl * (1 + markupPercent / 100);
      handleSellPriceExclChange(newSellPriceExcl.toFixed(2));
    }
  };

  const handleGrossProfitChange = (value: string) => {
    const profitAmount = parseFloat(value || '0');
    const costExcl = parseFloat(netCostExcl.toString());
    
    if (costExcl >= 0) {
      const newSellPriceExcl = costExcl + profitAmount;
      handleSellPriceExclChange(newSellPriceExcl.toFixed(2));
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
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
            <div className="text-sm font-medium mb-1">Sell Price (incl. GST)</div>
            <div className="relative">
              <span className="absolute left-2 top-1.5">$</span>
              <Input
                type="number"
                step="0.01"
                value={sellPriceIncl}
                onChange={(e) => handleSellPriceInclChange(e.target.value)}
                className="pl-5 text-center"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Sell Price (excl. GST)</div>
            <div className="relative">
              <span className="absolute left-2 top-1.5">$</span>
              <Input
                type="number"
                step="0.01"
                value={sellPriceExcl}
                onChange={(e) => handleSellPriceExclChange(e.target.value)}
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
                value={netCostExcl}
                onChange={(e) => handleNetCostExclChange(e.target.value)}
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
                value={grossProfitExcl}
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