import Header from "../components/Header";
import Menu from "../components/Menu";
import ConsultasList from "../components/ConsultasList";

export default function ConsultaPage() {
  return (
    <>
      <Header />
      <Menu active="consultas" />
      <div className="bg-(--cis-background) min-h-screen">
        <ConsultasList />
      </div>
    </>
  );
}
