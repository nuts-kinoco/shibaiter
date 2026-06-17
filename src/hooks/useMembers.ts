import { useState, useEffect } from 'react';

export function useMembers() {
  const [members, setMembers] = useState<string[]>(() => {
    const saved = localStorage.getItem('shibaiter_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(v => typeof v === 'string')) {
          // 保存済みの要素数が現在の4名より少ない場合は空文字で補完
          const normalized = Array.from({ length: 4 }, (_, i) => parsed[i] ?? '');
          return normalized;
        }
      } catch (e) {
        console.error('Failed to parse members from localStorage', e);
      }
    }
    return ['', '', '', ''];
  });

  const [teamName, setTeamName] = useState<string>(() => {
    return localStorage.getItem('shibaiter_teamname') || '';
  });

  useEffect(() => {
    localStorage.setItem('shibaiter_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('shibaiter_teamname', teamName);
  }, [teamName]);

  const updateMember = (index: number, name: string) => {
    setMembers(prev => {
      const newMembers = [...prev];
      newMembers[index] = name;
      return newMembers;
    });
  };

  return { members, updateMember, teamName, setTeamName };
}
