import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  // Mapeia os dados para nomes de colunas mais amigáveis
  const worksheetData = data.map(item => ({
    'Data de Cadastro': item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '-',
    'Nome': item.nomewpp || 'Sem nome',
    'Telefone': item.telefone || '-',
    'Origem': item.ORIGEM || 'Orgânico',
    'Assunto': item.ASSUNTO || '-',
    'Status': item.STATUS || 'Novo',
    'Etapa': item.etapa_atendimento || '0'
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

  // Gera o arquivo e inicia o download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};