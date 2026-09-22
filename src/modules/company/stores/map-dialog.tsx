"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import "leaflet/dist/leaflet.css";

type Point = { latitude: number; longitude: number };
export function StoreMapDialog({ initial, onClose, onConfirm }: { initial: Point | null; onClose: () => void; onConfirm: (point: Point) => void }) {
  const t = useTranslations("dashboard.stores");
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const initialPoint = useRef(initial);
  const selectedPoint = useRef(initial);
  const [selected, setSelected] = useState<Point | null>(initial);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;
    let resize: ResizeObserver | undefined;
    async function initialize() {
      try {
        const L = await import("leaflet");
        if (disposed || !container.current) return;
        const point = selectedPoint.current ?? initialPoint.current;
        map = L.map(container.current).setView(point ? [point.latitude, point.longitude] : [24.7136, 46.6753], point ? 12 : 11);
        mapRef.current = map;
        L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", { maxZoom: 20, attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).on("tileerror", () => { if (!disposed) setFailed(true); }).addTo(map);
        let marker: import("leaflet").CircleMarker | undefined;
        const place = (latitude: number, longitude: number) => {
          const next = { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)) };
          marker?.remove();
          marker = L.circleMarker([next.latitude, next.longitude], { radius: 9, color: "#ffffff", weight: 3, fillColor: "#12b9e8", fillOpacity: 1 }).addTo(map!);
          selectedPoint.current = next;
          setSelected(next);
        };
        if (point) place(point.latitude, point.longitude);
        map.on("click", (event: import("leaflet").LeafletMouseEvent) => place(event.latlng.lat, event.latlng.wrap().lng));
        resize = new ResizeObserver(() => map?.invalidateSize());
        resize.observe(container.current);
      } catch { if (!disposed) setFailed(true); }
    }
    void initialize();
    return () => { disposed = true; resize?.disconnect(); map?.remove(); mapRef.current = null; };
  }, [attempt]);
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[60] bg-black/30" /><Dialog.Content aria-describedby="store-map-hint" className="fixed start-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-5 shadow-xl rtl:translate-x-1/2"><div className="flex items-center justify-between"><Dialog.Title className="text-xl font-bold">{t("chooseOnMap")}</Dialog.Title><Dialog.Close asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={t("close")}><X className="size-4" /></Button></Dialog.Close></div><Dialog.Description id="store-map-hint" className="my-3 text-sm text-muted-foreground">{t("mapHint")}</Dialog.Description><div className="mb-3 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => mapRef.current?.setView([24.7136, 46.6753], 11)}>{t("riyadh")}</Button><Button type="button" variant="outline" size="sm" onClick={() => mapRef.current?.setView([21.4858, 39.1925], 11)}>{t("jeddah")}</Button><Button type="button" variant="outline" size="sm" onClick={() => mapRef.current?.fitBounds([[16.3, 34.5], [32.2, 55.7]])}>{t("saudiOverview")}</Button></div><div ref={container} className="relative z-0 h-[min(55dvh,480px)] w-full rounded-xl bg-muted" aria-label={t("location")} />{failed ? <div role="alert" className="mt-2 flex items-center justify-between gap-3 text-sm text-destructive"><span>{t("mapError")}</span><Button type="button" variant="outline" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>{t("retry")}</Button></div> : null}<div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground" role="status">{selected ? `${t("mapSelected")}: ${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}` : t("mapHint")}</p><Button type="button" disabled={!selected} onClick={() => { if (selected) onConfirm(selected); }}>{t("confirmLocation")}</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
