// client/src/components/common/RestaurantHours.js
import React from 'react';
import { Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const RestaurantHours = ({ showCompact = false }) => {
  if (showCompact) {
    return (
      <Alert variant="info" className="mt-3">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        <strong>Horaires :</strong> Déjeuner (Lun-Ven) 12h00-15h00 | Dîner (Jeu) 19h00-00h30
      </Alert>
    );
  }

  return (
    <div className="restaurant-hours">
      <h5 className="mb-3">
        <FontAwesomeIcon icon={faClock} className="me-2" />
        Horaires d'ouverture
      </h5>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Jour</th>
            <th>Déjeuner</th>
            <th>Dîner</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lundi</td>
            <td>12h00 - 15h00</td>
            <td className="text-muted">Fermé</td>
          </tr>
          <tr>
            <td>Mardi</td>
            <td>12h00 - 15h00</td>
            <td className="text-muted">Fermé</td>
          </tr>
          <tr>
            <td>Mercredi</td>
            <td>12h00 - 15h00</td>
            <td className="text-muted">Fermé</td>
          </tr>
          <tr>
            <td>Jeudi</td>
            <td>12h00 - 15h00</td>
            <td>19h00 - 00h30</td>
          </tr>
          <tr>
            <td>Vendredi</td>
            <td>12h00 - 15h00</td>
            <td className="text-muted">Fermé</td>
          </tr>
          <tr className="table-light">
            <td>Samedi</td>
            <td className="text-muted" colSpan="2">Fermé</td>
          </tr>
          <tr className="table-light">
            <td>Dimanche</td>
            <td className="text-muted" colSpan="2">Fermé</td>
          </tr>
        </tbody>
      </table>
      <p className="text-muted small">
        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
        Les réservations peuvent être effectuées jusqu'à 1 heure avant l'heure souhaitée et jusqu'à 30 jours à l'avance.
      </p>
    </div>
  );
};

export default RestaurantHours;