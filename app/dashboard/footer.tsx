import {Container} from "@/modules/core/components/base-layout";
import {MapPinIcon, PhoneIcon} from "lucide-react";

export function Footer() {
    return (
        <footer className="mt-auto bg-white">
            <div className="text-center py-3">
                <a href="/public">
                    قدرت گرفته با
                    ❤️
                    از
                    <span className="text-primary"> نوبتی</span>
                </a>
            </div>
        </footer>
    )
}