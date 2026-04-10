import { useState } from 'react';

const initialPriceList = [
  {
    flavor: 'Classic',
    prices: [
      { size: 'Small', amount: 110 },
      { size: 'Large', amount: 150 },
      { size: 'Bottled', amount: 170 },
    ],
  },
  {
    flavor: 'Spicy',
    prices: [
      { size: 'Small', amount: 110 },
      { size: 'Large', amount: 150 },
      { size: 'Bottled', amount: 170 },
    ],
  },
];

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function SalesPriceListCard() {
  const [priceList, setPriceList] = useState(initialPriceList);
  const [draftPriceList, setDraftPriceList] = useState(initialPriceList);
  const [isEditing, setIsEditing] = useState(false);

  const handleStartEdit = () => {
    setDraftPriceList(priceList);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftPriceList(priceList);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setPriceList(draftPriceList);
    setIsEditing(false);
  };

  const handlePriceChange = (flavorIndex, priceIndex, nextValue) => {
    const numericValue = Number.parseInt(nextValue, 10);

    if (Number.isNaN(numericValue) && nextValue !== '') {
      return;
    }

    setDraftPriceList((current) =>
      current.map((group, groupIndex) => {
        if (groupIndex !== flavorIndex) {
          return group;
        }

        return {
          ...group,
          prices: group.prices.map((price, itemIndex) => {
            if (itemIndex !== priceIndex) {
              return price;
            }

            return {
              ...price,
              amount: nextValue === '' ? 0 : Math.max(0, numericValue),
            };
          }),
        };
      })
    );
  };

  const displayedPriceList = isEditing ? draftPriceList : priceList;

  return (
    <article className="sales-price-card" aria-label="Product price list">
      <header className="sales-price-header">
        <h3>Price List</h3>
        {isEditing ? (
          <div className="sales-price-header-actions">
            <button type="button" className="sales-price-cancel-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button type="button" className="sales-price-edit-btn" onClick={handleSaveEdit}>
              Save
            </button>
          </div>
        ) : (
          <button type="button" className="sales-price-edit-btn" onClick={handleStartEdit}>
            Edit
          </button>
        )}
      </header>

      <div className="sales-price-table-wrap">
        <table className="sales-price-table">
          <thead>
            <tr>
              <th>Flavor</th>
              <th>Sizes</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {displayedPriceList.map((group, flavorIndex) =>
              group.prices.map((item, priceIndex) => (
                <tr key={`${group.flavor}-${item.size}`}>
                  {priceIndex === 0 ? <td rowSpan={group.prices.length}>{group.flavor}</td> : null}
                  <td>{item.size}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        className="sales-price-input"
                        value={item.amount}
                        onChange={(event) => handlePriceChange(flavorIndex, priceIndex, event.target.value)}
                      />
                    ) : (
                      pesoFormatter.format(item.amount)
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
