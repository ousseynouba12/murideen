"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { formatFCFA } from "@/lib/format";
import { IconPlus, IconTrash } from "@/components/ui/Icons";
import type { UserProfile } from "@/lib/types";

interface ShopSettingsDto {
  nomBoutique: string;
  emailContact: string | null;
  telephoneContact: string | null;
  fraisLivraisonDefaut: number;
  seuilLivraisonOfferte: number | null;
  banniereTitre: string | null;
  banniereTexte: string | null;
  banniereActive: boolean;
}

interface DeliveryZoneDto {
  id: number;
  nom: string;
  frais: number;
  delaiEstime: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  PROPRIETAIRE: "Propriétaire",
  GESTIONNAIRE: "Gestionnaire",
  PREPARATION: "Préparation",
};

export default function AdminReglagesPage() {
  const [settings, setSettings] = useState<ShopSettingsDto | null>(null);
  const [zones, setZones] = useState<DeliveryZoneDto[]>([]);
  const [newZone, setNewZone] = useState({ nom: "", frais: "", delaiEstime: "" });
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [newMember, setNewMember] = useState({ nom: "", email: "", role: "PREPARATION" });
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    adminFetch<ShopSettingsDto>("/api/admin/settings").then(setSettings);
    adminFetch<DeliveryZoneDto[]>("/api/admin/settings/zones").then(setZones);
    adminFetch<UserProfile[]>("/api/admin/team").then(setTeam);
  }

  useEffect(load, []);

  async function saveSettings() {
    if (!settings) return;
    await adminFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
    setMessage("Informations enregistrées.");
    setTimeout(() => setMessage(null), 2500);
  }

  async function addZone() {
    if (!newZone.nom || !newZone.frais) return;
    await adminFetch("/api/admin/settings/zones", {
      method: "POST",
      body: JSON.stringify({ nom: newZone.nom, frais: parseFloat(newZone.frais), delaiEstime: newZone.delaiEstime }),
    });
    setNewZone({ nom: "", frais: "", delaiEstime: "" });
    load();
  }

  async function removeZone(id: number) {
    await adminFetch(`/api/admin/settings/zones/${id}`, { method: "DELETE" });
    load();
  }

  async function addMember() {
    if (!newMember.nom || !newMember.email) return;
    await adminFetch("/api/admin/team", { method: "POST", body: JSON.stringify(newMember) });
    setNewMember({ nom: "", email: "", role: "PREPARATION" });
    load();
  }

  async function changeRole(id: number, role: string) {
    await adminFetch(`/api/admin/team/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });
    load();
  }

  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-semibold text-ink">Réglages</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-sand-raised p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Informations de la boutique</h2>
          {settings && (
            <div className="flex flex-col gap-3">
              <input
                placeholder="Nom de la boutique"
                value={settings.nomBoutique}
                onChange={(e) => setSettings({ ...settings, nomBoutique: e.target.value })}
                className="tap-target rounded-pill border border-line px-4 text-sm"
              />
              <input
                placeholder="E-mail de contact"
                value={settings.emailContact ?? ""}
                onChange={(e) => setSettings({ ...settings, emailContact: e.target.value })}
                className="tap-target rounded-pill border border-line px-4 text-sm"
              />
              <input
                placeholder="Téléphone de contact"
                value={settings.telephoneContact ?? ""}
                onChange={(e) => setSettings({ ...settings, telephoneContact: e.target.value })}
                className="tap-target rounded-pill border border-line px-4 text-sm"
              />
              <label className="flex flex-col gap-1 text-sm text-ink-soft">
                Frais de livraison par défaut
                <input
                  type="number"
                  value={settings.fraisLivraisonDefaut}
                  onChange={(e) => setSettings({ ...settings, fraisLivraisonDefaut: Number(e.target.value) })}
                  className="tap-target rounded-pill border border-line px-4 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-ink-soft">
                Livraison offerte à partir de (laisser vide pour désactiver)
                <input
                  type="number"
                  value={settings.seuilLivraisonOfferte ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, seuilLivraisonOfferte: e.target.value ? Number(e.target.value) : null })
                  }
                  className="tap-target rounded-pill border border-line px-4 text-sm text-ink"
                />
              </label>
              {message && <p className="text-sm text-ok">{message}</p>}
              <button onClick={saveSettings} className="tap-target rounded-pill bg-wine px-5 text-sm font-medium text-sand-raised hover:bg-wine-soft">
                Enregistrer
              </button>
            </div>
          )}
        </div>

        <div className="rounded-card border border-line bg-sand-raised p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Zones de livraison</h2>
          <div className="flex flex-col gap-2">
            {zones.map((z) => (
              <div key={z.id} className="flex items-center justify-between rounded-[12px] border border-line px-3 py-2 text-sm">
                <div>
                  <p className="text-ink">{z.nom}</p>
                  <p className="text-xs text-ink-faint">{formatFCFA(z.frais)} · {z.delaiEstime}</p>
                </div>
                <button
                  onClick={() => removeZone(z.id)}
                  aria-label={`Supprimer la zone ${z.nom}`}
                  className="tap-target text-ink-faint hover:text-warn"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <input
              placeholder="Zone"
              value={newZone.nom}
              onChange={(e) => setNewZone({ ...newZone, nom: e.target.value })}
              className="tap-target rounded-pill border border-line px-4 text-sm"
            />
            <input
              placeholder="Frais (FCFA)"
              type="number"
              value={newZone.frais}
              onChange={(e) => setNewZone({ ...newZone, frais: e.target.value })}
              className="tap-target rounded-pill border border-line px-4 text-sm"
            />
            <input
              placeholder="Délai estimé"
              value={newZone.delaiEstime}
              onChange={(e) => setNewZone({ ...newZone, delaiEstime: e.target.value })}
              className="tap-target col-span-2 rounded-pill border border-line px-4 text-sm"
            />
          </div>
          <button onClick={addZone} className="tap-target mt-3 flex items-center gap-2 rounded-pill border border-line-strong px-5 text-sm font-medium text-ink">
            <IconPlus className="h-4 w-4" /> Ajouter une zone
          </button>
        </div>

        <div className="rounded-card border border-line bg-sand-raised p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Équipe et rôles</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2 font-medium">Nom</th>
                  <th className="py-2 font-medium">E-mail</th>
                  <th className="py-2 font-medium">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 text-ink">{member.nom}</td>
                    <td className="py-2.5 text-ink-soft">{member.email}</td>
                    <td className="py-2.5">
                      <select
                        value={member.role}
                        onChange={(e) => changeRole(member.id, e.target.value)}
                        className="tap-target rounded-pill border border-line px-3 text-sm"
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              placeholder="Nom complet"
              value={newMember.nom}
              onChange={(e) => setNewMember({ ...newMember, nom: e.target.value })}
              className="tap-target rounded-pill border border-line px-4 text-sm"
            />
            <input
              placeholder="E-mail"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className="tap-target rounded-pill border border-line px-4 text-sm"
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="tap-target rounded-pill border border-line px-4 text-sm"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={addMember} className="tap-target mt-3 flex items-center gap-2 rounded-pill bg-wine px-5 text-sm font-medium text-sand-raised hover:bg-wine-soft">
            <IconPlus className="h-4 w-4" /> Ajouter un membre
          </button>
          <p className="mt-2 text-xs text-ink-faint">
            Un mot de passe temporaire est généré automatiquement ; la personne pourra le changer à sa première connexion.
          </p>
        </div>
      </div>
    </div>
  );
}
