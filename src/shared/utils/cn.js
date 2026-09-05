import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatPrice(kopecks) {
    const rubles = kopecks / 100;
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(rubles);
}
export function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}
export function formatTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}
export function generateId() {
    return Math.random().toString(36).substring(2, 10);
}
export function getRoleLabel(role) {
    const labels = {
        buyer: 'Покупатель',
        wholesaler: 'Оптовик (B2B)',
        supplier: 'Поставщик',
        security: 'Охранник (СКУД)',
        vet: 'Ветврач',
        picker: 'Сборщик',
    };
    return labels[role] || role;
}
export function getStatusLabel(status) {
    const labels = {
        pending: 'Ожидает',
        paid: 'Оплачен',
        preparing: 'Готовится',
        ready: 'Готов к выдаче',
        completed: 'Выдан',
        cancelled: 'Отменён',
        inspecting: 'На проверке',
        approved: 'Допущен',
        rejected: 'Отклонён',
        expected: 'Ожидается',
        arrived: 'Прибыл',
        allowed: 'Пропущен',
    };
    return labels[status] || status;
}
export function getUnitLabel(unit) {
    const labels = {
        kg: 'кг',
        piece: 'шт',
        box: 'коробка',
        pallet: 'паллет',
        half_carcass: 'полутушь',
    };
    return labels[unit] || unit;
}
//# sourceMappingURL=cn.js.map