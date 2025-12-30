// Sample data - replace with real data from your API/store
export const profitData = {
    title: 'Profit',
    value: '$5,405',
    trend: { value: '23.5%', direction: 'up' as const }
};

export const incomeExpenseStats = [
    { label: 'Income', value: '$23,635', color: 'text-green-500 dark:text-green-400' },
    { label: 'Expense', value: '-$18,230', color: 'text-red-600 dark:text-red-500' }
];

export const chartData = {
    series: [
        { name: 'Income', color: '#31C48D', data: [1420, 2720, 1820, 1420, 1650, 2120] },
        { name: 'Expense', data: [788, 810, 866, 788, 1100, 1200], color: '#F05252' }
    ],
    categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};