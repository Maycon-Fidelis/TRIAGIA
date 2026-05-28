import UploadForm from "@/components/upload/UploadForm";

export default function UploadPage() {
  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Novo Exame</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Faça upload de imagens DICOM ou JPG/PNG — a IA classifica a urgência automaticamente
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
