export class Item {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public qty: number,
    public cost_base: number,
    public cost_alt: number,
    public currency_rate?: number,
  ) {}
}

export class OrderDetail {
  constructor(
    public id: string,
    public items: Item[],
    public total: {
      qty: number;
      cost_base: number;
      cost_alt: number;
    },
    public tax_percentage: number,
    public base_currency: 'IDR' | 'USD',
    public alt_currency: 'IDR' | 'USD',
    public currency_rate?: number,
  ) {}
}

