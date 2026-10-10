import { afterEach, describe, expect, it, vi } from "vitest";
import { diasDesde, hoyISO, semanaDelMes, toISODate } from "./dates";
import { carritoVencido, estadoMantenimiento, normalizeCarrito, registrarMantenimiento } from "./carritos";
import { normalizeHermano, whatsappLink } from "./hermanos";
import { normalizarTexto } from "./text";

afterEach(() => vi.useRealTimers());

describe("fechas", () => {
  it("hoyISO usa la fecha local, no UTC", () => {
    // 22:30 en hora local: en UTC-3 ya sería el día siguiente.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 10, 22, 30));
    expect(hoyISO()).toBe("2026-10-10");
  });
  it("toISODate rellena con ceros", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
  it("diasDesde cuenta días enteros", () => {
    expect(diasDesde("2026-10-01", new Date(2026, 9, 10, 23, 0))).toBe(9);
    expect(diasDesde("", new Date())).toBeNull();
  });
  it("semanaDelMes", () => {
    expect([1, 7, 8, 14, 15, 29].map((d) => semanaDelMes(new Date(2026, 9, d)))).toEqual([1, 1, 2, 2, 3, 5]);
  });
});

describe("carritos", () => {
  const hoy = new Date(2026, 9, 10);
  it("solo los operativos vencen", () => {
    expect(carritoVencido({ estado: "repuesto" }, hoy)).toBe(false);
    expect(carritoVencido({ estado: "operativo", ultimoControlFisico: "", ultimaRevisionPublicaciones: "" }, hoy)).toBe(true);
  });
  it("calcula control y revisión por separado", () => {
    const c = { estado: "operativo", ultimoControlFisico: "2026-09-01", ultimaRevisionPublicaciones: "2026-10-01" };
    expect(estadoMantenimiento(c, hoy)).toEqual({ controlVencido: true, pubVencida: false });
  });
  it("registrarMantenimiento actualiza la fecha y agrega al historial", () => {
    const c = registrarMantenimiento({ id: "c1", historial: [{ tipo: "revision", fecha: "2026-09-01" }] }, "control", "2026-10-10");
    expect(c.ultimoControlFisico).toBe("2026-10-10");
    expect(c.historial).toEqual([{ tipo: "control", fecha: "2026-10-10" }, { tipo: "revision", fecha: "2026-09-01" }]);
  });
  it("normalizeCarrito migra ultimoMantenimiento y 'de repuesto'", () => {
    const c = normalizeCarrito({ id: "c", estado: "de repuesto", ultimoMantenimiento: "2026-01-01" });
    expect(c.estado).toBe("repuesto");
    expect(c.ultimoControlFisico).toBe("2026-01-01");
    expect(c.historial).toEqual([]);
  });
});

describe("hermanos", () => {
  it("normalizeHermano migra días y horario preferido", () => {
    const h = normalizeHermano({ id: "h", nombre: "Ana", diasPreferidos: ["Lun", "Sáb"], horarioPreferido: "Mañana" });
    expect(h.disponibilidad).toEqual(["Lunes mañana", "Sábado mañana"]);
    expect(h).not.toHaveProperty("diasPreferidos");
  });
  it("whatsappLink arma números argentinos", () => {
    expect(whatsappLink("11 1234-5678")).toBe("https://wa.me/5491112345678");
    expect(whatsappLink("011 1234-5678")).toBe("https://wa.me/5491112345678");
    expect(whatsappLink("+54 9 11 1234 5678")).toBe("https://wa.me/5491112345678");
    expect(whatsappLink("")).toBeNull();
  });
});

describe("normalizarTexto", () => {
  it("ignora mayúsculas y acentos", () => {
    expect(normalizarTexto("Márquez")).toBe("marquez");
  });
});
