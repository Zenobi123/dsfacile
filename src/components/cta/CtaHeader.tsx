
interface CtaHeaderProps {
  title: string;
  description: string;
}

const CtaHeader = ({ title, description }: CtaHeaderProps) => {
  return (
    <>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
        {description}
      </p>
    </>
  );
};

export default CtaHeader;
