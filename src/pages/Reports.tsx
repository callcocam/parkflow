import { useOutletContext } from 'react-router-dom';
import type { AllocationContext, Volunteer } from '../types';

export function Reports() {
  const { volunteers, shifts, allocations } = useOutletContext<AllocationContext>();

  const generateCSV = () => {
    if (shifts.length === 0) {
      alert("Não há turnos para exportar.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Data,Turno,Local,Voluntario,Telefone,Congregacao\n";

    const sortedShifts = [...shifts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));

    sortedShifts.forEach(shift => {
      const allocatedVolunteerIds = allocations[shift.id] || [];
      if (allocatedVolunteerIds.length > 0) {
        allocatedVolunteerIds.forEach((volunteerId: string) => {
          const volunteer = volunteers.find((v: Volunteer) => v.id === volunteerId);
          if (volunteer) {
            const row = [
              new Date(shift.date).toLocaleDateString('pt-BR'),
              `"${shift.startTime}-${shift.endTime}"`,
              shift.location,
              volunteer.name,
              `"${volunteer.phone}"`,
              volunteer.congregation
            ].join(",");
            csvContent += row + "\n";
          }
        });
      } else {
        const row = [
          new Date(shift.date).toLocaleDateString('pt-BR'),
          `"${shift.startTime}-${shift.endTime}"`,
          shift.location,
          "Nenhum voluntário alocado",
          "",
          ""
        ].join(",");
        csvContent += row + "\n";
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alocacao_escala.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (window.confirm("Você tem certeza que deseja apagar TODOS os dados? Voluntários, turnos e alocações serão perdidos e o sistema será reiniciado com os dados iniciais.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      
      <div className="space-y-4">
        <button 
          onClick={generateCSV}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Exportar Alocações para CSV
        </button>

        <div className="mt-8 p-4 border border-red-400 rounded bg-red-50">
          <h2 className="text-xl font-bold text-red-700">Área de Risco</h2>
          <p className="text-red-600 mt-2">
            O botão abaixo irá apagar todos os dados do aplicativo (voluntários, turnos, alocações) e restaurar os dados iniciais. Use com cuidado.
          </p>
          <button 
            onClick={handleResetData}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Resetar Dados do Aplicativo
          </button>
        </div>
      </div>
    </div>
  );
} 