'use client'
import { isAuthenticated } from "@/lib/services/authService";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;

}) {
    const router = useRouter()
    const [checked, setChecked] = useState(false)

    useEffect
    (() => {
        if (!isAuthenticated()) {
            router.replace('/')
        } else {
            setChecked(true)
        }
    }, [])

    if (!checked) return null
    return (
        <>
            <div className="flex min-h-screen bg-[#050b1f]">
                <aside className="w-60  bg-white/5
                         backdrop-blur-md
                         shadow-lg text-white border-r-2 border-[#1e2a52]">
                    <Sidebar />
                </aside>

                <main className="flex-1 bg-[#050b1f]">
                    <nav className="
                         bg-white/5
                         backdrop-blur-md
                         shadow-lg
                           border-b-2 border-[#1e2a52] ">
                        <Header />
                    </nav>
                    <div className="p-9">{children}</div>
                </main>
            </div>
        </>
    )
}