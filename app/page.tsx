import Image from 'next/image';
import Header from './components/Header';
 
 
 
 
 

export default function Home() {
  // const handleRegionChange = (provinceId: string, regencyId: string) => {
  //   console.log('Selected Region:', { provinceId, regencyId });
  //   // You can use these IDs to filter products or perform other actions
  // };

  // Fetch provinces data on the server
 

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4">

        <div className="flex flex-wrap gap-6 mb-8"> {/* Use flexbox for side-by-side arrangement */}
          <div className="flex-1 min-w-[300px] bg-white p-6 rounded-lg shadow-md"> {/* Flex-1 to allow growing, min-w for responsiveness */}
 
          </div>

          <div className="flex-1 min-w-[300px] bg-white p-6 rounded-lg shadow-md"> {/* Flex-1 to allow growing, min-w for responsiveness */}
 
          </div>
        </div>


      </main>
    </div>
  );
}
