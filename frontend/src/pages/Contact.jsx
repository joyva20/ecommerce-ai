import Title from "../components/Title";
import { assets } from "../assets/assets";
const Contact = () => {
  return (
    <div>
      <div className="border-t pt-10 text-center text-2xl">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>
      <div className="my-10 mb-28 flex flex-col justify-center gap-10 md:flex-row">
        <img
          className="w-full md:max-w-[480px]"
          src={assets.contact_img}
          alt="Contact Image"
        />
        <div className="flex flex-col items-start justify-center gap-6">
          <p className="text-xl font-semibold text-gray-600">Our Store</p>
          <p className="text-gray-400">
            <span className="font-semibold">(Not Real Address)</span>
            <br />
            Forever Store 1234 <br /> Elm Street Springfield, IL 62704, USA
          </p>
          <p className="text-gray-500">
            Tel: (+98) 905 95 95 086 <br />
            Email: navidzare7775@gmail.com
          </p>
          <p className="text-xl font-semibold text-gray-600">
            Careers at Forever
          </p>
          <p className="text-gray-500">
            Learn more about our teams and job openings.
          </p>
          <button className="border border-black px-8 py-4 text-sm transition-all duration-300 hover:bg-black hover:text-white">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
