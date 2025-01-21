import React from 'react';
import '../assets/custom.css';

export function CollectionFilter() {
  // Update the displayed sort option based on the current URL parameters
  const updateSortLabel = () => {
    const url = new URL(window.location.href);
    const sortKey = url.searchParams.get('sortkey') || 'Default';
    const reverse = url.searchParams.get('reverse') === 'true';
    const container = document.querySelector('.collection-filter-container');

    if (container) {
      const labelElement = container.querySelector('p');
      const currentSortItem = Array.from(
        container.querySelectorAll('li')
      ).find(
        (item) =>
          item.getAttribute('data-sort-key') === sortKey &&
          item.getAttribute('data-sort-reverse') === String(reverse)
      );

      if (labelElement) {
        labelElement.textContent = currentSortItem
          ? currentSortItem.textContent.trim()
          : 'Default';
      }
    }
  };

  const onClickSort = (event) => {
    const container = event.target.closest('.collection-filter-container');
    if (container) {
      container.classList.toggle('show');
    }
  };

  const onSortParam = (event) => {
    const listItem = event.target.closest('li');
    if (!listItem) return;

    const url = new URL(window.location.href);
    url.searchParams.set('sortkey', listItem.getAttribute('data-sort-key'));
    url.searchParams.set('reverse', listItem.getAttribute('data-sort-reverse'));

    const container = listItem.closest('.collection-filter-container');
    if (container && container.classList.contains('show')) {
      const labelElement = container.querySelector('p');
      if (labelElement) {
        labelElement.textContent = listItem.textContent.trim();
      }

      window.location.href = url.toString();
    }
  };

  React.useEffect(() => {
    updateSortLabel();
  }, []);

  return (
    <div className="flex gap-[17px] items-center py-[22px] px-[98px] ml-auto mb-[26px] bg-accent">
      <p className="text-[20px]">Sort by</p>
      <div className="relative collection-filter-container" onClick={onClickSort}>
        <p className="block h-[55px] w-[200px] bg-white text-[#9F9F9F] p-[12px] text-[20px]">
          Default
        </p>
        <ul className="absolute flex-col gap-[4px] text-[18px] bg-white w-[200px] p-[10px] mt-[10px] z-10">
          <li data-sort-key="MANUAL" data-sort-reverse="false" onClick={onSortParam}>
            Featured
          </li>
          <li data-sort-key="TITLE" data-sort-reverse="false" onClick={onSortParam}>
            Alphabetically, A-Z
          </li>
          <li data-sort-key="TITLE" data-sort-reverse="true" onClick={onSortParam}>
            Alphabetically, Z-A
          </li>
          <li data-sort-key="PRICE" data-sort-reverse="true" onClick={onSortParam}>
            Price, High-Low
          </li>
          <li data-sort-key="PRICE" data-sort-reverse="false" onClick={onSortParam}>
            Price, Low-High
          </li>
        </ul>
      </div>
    </div>
  );
}
