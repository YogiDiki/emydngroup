import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Redirect ke BarakahKu PWA
    window.location.href = "/barakah.html";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">🕌 Memuat BarakahKu...</h1>
        <p className="text-xl text-muted-foreground">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
};

export default Index;
