import { Hero } from "@/components/home/hero";
import { BookTeaser, BuildTeaser, Filmstrip, Manifesto, Process, Scope, Statement } from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Filmstrip />
      <BuildTeaser />
      <Scope />
      <Statement />
      <Process letter="E" />
      <BookTeaser />
    </>
  );
}
