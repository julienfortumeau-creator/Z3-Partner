import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { VehicleProfile, Expense } from '../store/useVehicleStore';

/**
 * Génère un PDF professionnel de l'historique complet du véhicule.
 */
export const generateMaintenancePDF = async (profile: VehicleProfile, expenses: Expense[]) => {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalAmount = expenses.reduce((acc, current) => acc + current.amount, 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Carnet d'Entretien - Z3 Copilot</title>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          color: #333;
          line-height: 1.4;
          margin: 0;
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0066b2;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          color: #0066b2;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: -1px;
        }
        .logo span {
          font-weight: 300;
          color: #666;
        }
        .document-title {
          text-align: right;
        }
        .document-title h1 {
          margin: 0;
          font-size: 20px;
          color: #333;
          text-transform: uppercase;
        }
        .document-title p {
          margin: 5px 0 0;
          font-size: 12px;
          color: #666;
        }
        .vehicle-info {
          display: flex;
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .info-block {
          flex: 1;
        }
        .info-block h3 {
          margin: 0 0 5px;
          font-size: 11px;
          text-transform: uppercase;
          color: #0066b2;
        }
        .info-block p {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          border: 1px solid #eee;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card h4 {
          margin: 0 0 5px;
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
        }
        .stat-card p {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          padding: 12px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: #666;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          font-size: 12px;
          vertical-align: top;
        }
        .date-col { width: 15%; }
        .mileage-col { width: 15%; text-align: right; }
        .label-col { width: 40%; font-weight: 500; }
        .garage-col { width: 15%; color: #666; }
        .price-col { width: 15%; text-align: right; font-weight: bold; }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 10px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        @media print {
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Z3 <span>Copilot</span></div>
        <div class="document-title">
          <h1>Journal de Maintenance</h1>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div class="vehicle-info">
        <div class="info-block">
          <h3>Véhicule</h3>
          <p>${profile.model}</p>
        </div>
        <div class="info-block">
          <h3>Année</h3>
          <p>${profile.year}</p>
        </div>
        <div class="info-block">
          <h3>Kilométrage</h3>
          <p>${profile.mileage.toLocaleString()} km</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h4>Interventions</h4>
          <p>${expenses.length}</p>
        </div>
        <div class="stat-card">
          <h4>Investissement Total</h4>
          <p>${totalAmount.toLocaleString()} €</p>
        </div>
        <div class="stat-card">
          <h4>Coût / km</h4>
          <p>${(totalAmount / (profile.mileage || 1)).toFixed(2)} €</p>
        </div>
      </div>

      <h2>Historique Détaillé</h2>
      <table>
        <thead>
          <tr>
            <th class="date-col">Date</th>
            <th class="mileage-col">KM</th>
            <th class="label-col">Opération</th>
            <th class="garage-col">Garage</th>
            <th class="price-col">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${sortedExpenses.map(exp => `
            <tr>
              <td>${new Date(exp.date).toLocaleDateString('fr-FR')}</td>
              <td style="text-align: right;">${(exp.mileage || 0).toLocaleString()}</td>
              <td>
                ${exp.label}
                <div style="font-size: 10px; color: #999; font-weight: normal; margin-top: 2px;">
                  Catégorie : ${exp.category} ${exp.notes ? '• ' + exp.notes : ''}
                </div>
              </td>
              <td>${exp.garageName || 'Particulier'}</td>
              <td style="text-align: right;">${exp.amount.toLocaleString()} €</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Ce document a été généré via l'application Z3 Copilot. Les données sont déclaratives et basées sur l'historique saisi par l'utilisateur.</p>
        <p>&copy; ${new Date().getFullYear()} Z3 Copilot - Compagnon d'Entretien BMW Z3</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });
    
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Historique de maintenance ${profile.model}`,
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};
