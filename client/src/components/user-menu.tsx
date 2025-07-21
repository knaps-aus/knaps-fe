import { useKeycloak } from "@react-keycloak/web";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserMenu() {
  const { keycloak } = useKeycloak();
  const name =
    (keycloak.tokenParsed as any)?.name ||
    (keycloak.tokenParsed as any)?.preferred_username ||
    "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 focus:outline-none">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => keycloak.logout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
