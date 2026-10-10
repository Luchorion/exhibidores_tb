import { describe, expect, it } from "vitest";
import {
  advertenciasTurno,
  computeConflictMap,
  describeFrecuencia,
  franjaDeHora,
  normalizeTurno,
  textoPrograma,
  turnoOcurreEn,
  turnosSolapan,
  validarTurno,
} from "./turnos";

const base = { dia: "Sábado", frecuencia: "Semanal", semanas: [], horaInicio: "09:00", horaFin: "11:00", carritoIds: [], hermanoIds: [] };

describe("turnosSolapan", () => {
  it("detecta superposición el mismo día", () => {
    expect(turnosSolapan(base, { ...base, horaInicio: "10:00", horaFin: "12:00" })).toBe(true);
  });
  it("turnos consecutivos no se superponen", () => {
    expect(turnosSolapan(base, { ...base, horaInicio: "11:00", horaFin: "12:00" })).toBe(false);
  });
  it("días distintos no se superponen", () => {
    expect(turnosSolapan(base, { ...base, dia: "Domingo" })).toBe(false);
  });
  it("quincenales en semanas distintas no chocan", () => {
    const a = { ...base, frecuencia: "Quincenal", semanas: [1, 3] };
    const b = { ...base, frecuencia: "Quincenal", semanas: [2, 4] };
    expect(turnosSolapan(a, b)).toBe(false);
  });
  it("una quincenal sin semanas definidas puede chocar con cualquiera", () => {
    const a = { ...base, frecuencia: "Quincenal", semanas: [] };
    const b = { ...base, frecuencia: "Mensual", semanas: [2] };
    expect(turnosSolapan(a, b)).toBe(true);
  });
  it("una semanal choca con una mensual del mismo horario", () => {
    expect(turnosSolapan(base, { ...base, frecuencia: "Mensual", semanas: [4] })).toBe(true);
  });
});

describe("computeConflictMap", () => {
  it("marca hermanos compartidos", () => {
    const map = computeConflictMap([
      { ...base, id: "a", hermanoIds: ["h1", "h2"] },
      { ...base, id: "b", hermanoIds: ["h2"] },
    ]);
    expect(map.a).toEqual([{ tipo: "hermano", id: "h2", otroId: "b" }]);
    expect(map.b).toEqual([{ tipo: "hermano", id: "h2", otroId: "a" }]);
  });
  it("marca el mismo carrito en dos turnos superpuestos", () => {
    const map = computeConflictMap([
      { ...base, id: "a", carritoIds: ["c1"] },
      { ...base, id: "b", carritoIds: ["c1"] },
    ]);
    expect(map.a).toEqual([{ tipo: "carrito", id: "c1", otroId: "b" }]);
  });
  it("sin superposición no hay conflicto", () => {
    const map = computeConflictMap([
      { ...base, id: "a", hermanoIds: ["h1"] },
      { ...base, id: "b", hermanoIds: ["h1"], horaInicio: "15:00", horaFin: "17:00" },
    ]);
    expect(map).toEqual({});
  });
});

describe("turnoOcurreEn", () => {
  // Octubre 2026: los sábados son 3, 10, 17, 24 y 31.
  const sab = (d) => new Date(2026, 9, d);
  it("semanal sale todos los sábados", () => {
    expect([3, 10, 17, 24, 31].every((d) => turnoOcurreEn(base, sab(d)))).toBe(true);
  });
  it("quincenal 1ª y 3ª sale el 1er y 3er sábado", () => {
    const t = { ...base, frecuencia: "Quincenal", semanas: [1, 3] };
    expect([3, 10, 17, 24, 31].map((d) => turnoOcurreEn(t, sab(d)))).toEqual([true, false, true, false, false]);
  });
  it("no sale otro día de la semana", () => {
    expect(turnoOcurreEn(base, new Date(2026, 9, 4))).toBe(false);
  });
});

describe("describeFrecuencia", () => {
  it("describe las semanas", () => {
    expect(describeFrecuencia({ frecuencia: "Quincenal", semanas: [2, 4] })).toBe("Quincenal · 2ª y 4ª semana");
    expect(describeFrecuencia({ frecuencia: "Mensual", semanas: [] })).toBe("Mensual (semanas sin definir)");
    expect(describeFrecuencia({ frecuencia: "Semanal" })).toBe("Semanal");
  });
});

describe("validarTurno", () => {
  it("pide los campos obligatorios", () => {
    expect(validarTurno({ dia: "", horaInicio: "", puntoId: "" })).toHaveLength(3);
  });
  it("rechaza fin antes del inicio", () => {
    expect(validarTurno({ dia: "Lunes", horaInicio: "10:00", horaFin: "09:00", puntoId: "p1" })).toEqual([
      "La hora de fin tiene que ser posterior a la de inicio.",
    ]);
  });
  it("acepta un turno completo", () => {
    expect(validarTurno({ dia: "Lunes", horaInicio: "10:00", horaFin: "12:00", puntoId: "p1" })).toEqual([]);
  });
});

describe("advertenciasTurno", () => {
  const hermanos = [
    { id: "h1", nombre: "Ana", estado: "aprobado", disponibilidad: ["Sábado mañana"] },
    { id: "h2", nombre: "Juan", estado: "pendiente", disponibilidad: [] },
    { id: "h3", nombre: "Luis", estado: "aprobado", disponibilidad: ["Lunes tarde"] },
  ];
  it("avisa no aprobados y fuera de disponibilidad", () => {
    const avisos = advertenciasTurno({ ...base, hermanoIds: ["h1", "h2", "h3"] }, hermanos);
    expect(avisos).toEqual([
      "Juan no está aprobado/a para exhibidores.",
      "Luis no marcó disponibilidad el Sábado a la mañana.",
    ]);
  });
  it("franjas horarias", () => {
    expect(["08:00", "12:30", "16:00", "20:00"].map(franjaDeHora)).toEqual(["mañana", "mediodía", "tarde", "noche"]);
  });
});

describe("normalizeTurno", () => {
  it("migra el esquema viejo (fecha + un carrito)", () => {
    const t = normalizeTurno({ id: "x", fecha: "2026-10-10", carritoId: "c1", conductor: "Pedro" });
    expect(t.dia).toBe("Sábado");
    expect(t.carritoIds).toEqual(["c1"]);
    expect(t.conductorLibre).toBe("Pedro");
    expect(t.semanas).toEqual([]);
  });
  it("es idempotente", () => {
    const t = normalizeTurno({ id: "x", fecha: "2026-10-10", conductor: "Pedro" });
    expect(normalizeTurno(t)).toEqual(t);
  });
});

describe("textoPrograma", () => {
  it("arma el texto por día", () => {
    const texto = textoPrograma(
      [{ ...base, id: "a", puntoId: "p1", hermanoIds: ["h1"], carritoIds: ["c1"] }],
      { puntos: [{ id: "p1", nombre: "Estación" }], hermanos: [{ id: "h1", nombre: "Ana" }], carritos: [{ id: "c1", numero: 3 }] }
    );
    expect(texto).toContain("*SÁBADO*");
    expect(texto).toContain("• 09:00–11:00 Estación — Ana");
    expect(texto).toContain("Carrito 3");
  });
});
