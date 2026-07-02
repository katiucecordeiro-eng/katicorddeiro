export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pranchas", label: "Biblioteca de Pranchas" },
  { href: "/quiz", label: "Quiz" },
  { href: "/pomodoro", label: "Pomodoro" },
  { href: "/colecao", label: "Minha Coleção" },
  { href: "/perfil", label: "Perfil" },
];
