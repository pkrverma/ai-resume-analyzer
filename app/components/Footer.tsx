import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white mt-auto py-6">
      <div className="flex flex-row justify-center items-center md:text-lg text-sm">
        &copy; {new Date().getFullYear()}&nbsp; Made with ❤️ by&nbsp;
        <a
          href="https://pulkitkrverma.tech"
          className="text-[#61dafb] underline"
          target="_blank"
          rel="noopener noreferrer"
        > 
          Pulkit K. Verma.
        </a>
      </div>
    </footer>
  );
};

export default Footer;
