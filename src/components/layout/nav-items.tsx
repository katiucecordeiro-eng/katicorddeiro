export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pranchas", label: "Biblioteca de Pranchas" },
  { href: "/cadernos", label: "Cadernos para Imprimir" },
  { href: "/quiz", label: "Quiz" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/ranking", label: "Ranking" },
  { href: "/pomodoro", label: "Pomodoro" },
  { href: "/colecao", label: "Minha Coleção" },
  { href: "/perfil", label: "Perfil" },
];
