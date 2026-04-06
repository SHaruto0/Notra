import SideBar from "@/components/SideBar";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full flex flex-row">
      <SideBar />
      {children}
    </div>
  );
}
