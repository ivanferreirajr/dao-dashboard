import { useAddress, useMetamask, useEditionDrop, useToken } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';

const App = () => {
  // Usando os hooks que o thirdweb nos dá.
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);

  // inicializar o contrato editionDrop
  const editionDrop = useEditionDrop("0xEf0e209B614fc2123274A66748f9d4aec58cEAD2");
  const token = useToken("0xfD51e526F4E1a51e07D92857BD65c25931fCbf51");

  // Variável de estado para sabermos se o usuário tem nosso NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming nos ajuda a saber se está no estado de carregando enquanto o NFT é cunhado.
  const [isClaiming, setIsClaiming] = useState(false);

  // Guarda a quantidade de tokens que cada membro tem nessa variável de estado.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // O array guardando todos os endereços dos nosso membros.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // Uma função para diminuir o endereço da carteira de alguém, não é necessário mostrar a coisa toda.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // Esse useEffect pega todos os endereços dos nosso membros detendo nosso NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    
    // Do mesmo jeito que fizemos no arquivo 7-airdrop-token.js! Pegue os usuários que tem nosso NFT
    // com o tokenId 0.
    const getAllAddresses = async () => {
      try {
        const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
        console.log("🚀 Endereços de membros", memberAddresses);
      } catch (error) {
        console.error("falha ao pegar lista de membros", error);
      }

    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop.history]);

  // Esse useEffect pega o # de tokens que cada membro tem.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Pega todos os saldos.
    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("👜 Quantidades", amounts);
      } catch (error) {
        console.error("falha ao buscar o saldo dos membros", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token.history]);

  // Agora, nós combinamos os memberAddresses e os memberTokenAmounts em um único array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      // Se o endereço não está no memberTokenAmounts, isso significa que eles não
      // detêm nada do nosso token.
      const member = memberTokenAmounts?.find(({ holder }) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      }
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // Se ele não tiver uma carteira conectada, saia!
    if (!address) {
      return
    }

    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0)
        // Se o saldo for maior do que 0, ele tem nosso NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true)
          console.log("🌟 esse usuário tem o NFT de membro!")
        } else {
          setHasClaimedNFT(false)
          console.log("😭 esse usuário NÃO tem o NFT de membro.")
        }
      } catch (error) {
        setHasClaimedNFT(false)
        console.error("Falha ao ler saldo", error)
      }
    }
    checkBalance()
  }, [address, editionDrop])

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop.claim("0", 1);
      console.log(`🌊 Cunhado com sucesso! Olhe na OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Falha ao cunhar NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!address) {
    return (
      <div className="landing">
        <h1>Bem-vind@s à OssDAO - a DAO dos jiujiteiros</h1>
        <button onClick={connectWithMetamask} className="btn-hero">
          Conecte sua carteira
        </button>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>Página dos membros da DAO 🥋</h1>
        <p>Parabéns por fazer parte desse clube de cascas grossas!</p>
        <div>
          <div>
            <h2>Lista de Membros</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Endereço</th>
                  <th>Quantidade de Tokens</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mint-nft">
      <h1>Cunhe gratuitamente seu NFT de membro 🥋 da OssDAO</h1>
      <button
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Cunhando..." : "Cunhe seu NFT (GRATIS)"}
      </button>
    </div>
  );
};

export default App;
