'use client';
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "./ui/breadcrumb";
import { Button } from "./ui/button";

const Header = ({routeName}: { routeName: string}) => {
    const router = useRouter();
    return (
        <header className="h-16 bg-background border-b w-full">
        <div className="h-full px-4 grid grid-cols-3 items-center">
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => router.back()}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden md:flex items-center">
            <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm"
            onClick={() => router.back()}
            >
            <ChevronLeft className="h-4 w-4" />
            Back
            </Button>
        </div>
        <div className="flex justify-center">
        <Breadcrumb>
            <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbPage className="text-sm">
                {routeName}
                </BreadcrumbPage>
            </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        </div>
        </div>
        
    </header>
    );
}

export default Header;