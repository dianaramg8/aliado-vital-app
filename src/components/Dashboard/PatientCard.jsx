// src/components/Dashboard/PatientCard.jsx
import React from 'react'
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaRegHospital,
  FaBirthdayCake
} from 'react-icons/fa'

export default function PatientCard({ userData }) {
  if (!userData) return null

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">Datos del Paciente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700">
        <p><FaUser className="inline-block mr-2 text-blue-600" /> <strong>Nombre:</strong> {userData.nombre}</p>
        <p><strong>Cédula:</strong> {userData.cedula}</p>
        <p><FaRegHospital className="inline-block mr-2 text-blue-600" /> <strong>EPS:</strong> {userData.eps}</p>
        <p><FaBirthdayCake className="inline-block mr-2 text-blue-600" /> <strong>Edad:</strong> {userData.edad} años</p>
        <p><FaMapMarkerAlt className="inline-block mr-2 text-blue-600" /> <strong>Ciudad:</strong> {userData.ciudad}</p>
        <p><strong>Dirección:</strong> {userData.direccion}</p>
        <p><FaPhone className="inline-block mr-2 text-blue-600" /> <strong>Teléfono:</strong> {userData.telefono}</p>
        <p><FaEnvelope className="inline-block mr-2 text-blue-600" /> <strong>Correo:</strong> {userData.correo}</p>
      </div>
    </div>
  )
}
