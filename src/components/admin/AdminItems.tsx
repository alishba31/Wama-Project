// 'use client';
// import { navLinks } from "@/app/admin/layout";
// import { cn } from "@/lib/utils";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// export function AdminItems(){
//     const pathname = usePathname()
//     return(
//         <>
//         {navLinks.map((item)=>(
//             <Link href={item.href} key={item.name} className={cn(
//                 pathname == item.href ? 'bg-muted text-primary' : 'text-muted-foreground bg-none', 
//                 'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary/70' 
//             )}>
//             <item.icon/>
//             {item.name}
//             </Link>
//         ))  }
//         </>
//     )
// }

// New Code
'use client';
import { navLinks } from "@/app/admin/layout";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminItemsProps {
    handleNavClick: (href: string) => void;
}

export function AdminItems({ handleNavClick }: AdminItemsProps) {
    const pathname = usePathname();

    return (
        <>
            {navLinks.map((item) => (
                <Link
                    href={item.href}
                    key={item.name}
                    onClick={(e) => {
                        e.preventDefault(); // Prevent default navigation
                        handleNavClick(item.href); // Trigger loading bar and navigate
                    }}
                    className={cn(
                        pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground bg-none', 
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary/70'
                    )}
                >
                    <item.icon />
                    {item.name}
                </Link>
            ))}
        </>
    );
}
