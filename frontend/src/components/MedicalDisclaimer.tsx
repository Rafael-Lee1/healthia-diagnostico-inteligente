export function MedicalDisclaimer() {
  return (
    <div
      className="rounded-[1.4rem] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,221,0.9))] px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-[linear-gradient(180deg,rgba(69,26,3,0.34),rgba(51,21,4,0.24))] dark:text-amber-100"
      role="note"
      aria-label="Aviso médico"
    >
      <strong className="font-semibold">Aviso médico:</strong> Esta ferramenta é de apoio e não substitui avaliação médica profissional.
    </div>
  );
}
