import { useState, useEffect } from 'react';

export const STATUS_CONFIG = {
  novo:         { label: 'Novo',          emoji: '🔵', color: '#1E3A5F', bg: '#EFF4FF', border: '#C5D8F0' },
  tentativa:    { label: 'Tentativa',     emoji: '📞', color: '#7C6200', bg: '#FFF8E6', border: '#F0D980' },
  agendado:     { label: 'Agendado',      emoji: '📅', color: '#0D5C3A', bg: '#EDFAF4', border: '#A8DFC5' },
  apresentado:  { label: 'Apresentado',   emoji: '✅', color: '#3D2B8E', bg: '#F3F0FF', border: '#C4B5FD' },
  fechamento:   { label: 'Fechamento',    emoji: '🤝', color: '#5B1FAD', bg: '#F5F0FF', border: '#D4B8FF' },
  semInteresse: { label: 'Sem Interesse', emoji: '❌', color: '#8B1A1A', bg: '#FFF0F0', border: '#FFBABA' },
  pausado:      { label: 'Pausado',       emoji: '⏸️', color: '#5C5C5C', bg: '#F5F5F5', border: '#DCDCDC' },
  cliente:      { label: 'Cliente',       emoji: '⭐', color: '#7C4A00', bg: '#FFF8ED', border: '#F0C878' },
  retornar:     { label: 'Retornar',      emoji: '🔄', color: '#1A5C7C', bg: '#EDF8FF', border: '#A8D8F0' },
  semContato:   { label: 'Sem Contato',   emoji: '📵', color: '#5C5C5C', bg: '#F5F5F5', border: '#DCDCDC' },
  jaFalei:      { label: 'Já Falei',      emoji: '💬', color: '#3D5C1F', bg: '#F0F8E8', border: '#B8DCA8' },
  PC:           { label: 'PC',            emoji: '📋', color: '#1A3A7C', bg: '#EDF2FF', border: '#A8B8F0' },
};

export const FUNIL_ORDER = ['novo','tentativa','agendado','apresentado','fechamento','cliente','retornar','pausado','semInteresse','semContato','jaFalei','PC'];

export const LEADS_INICIAIS = [];
