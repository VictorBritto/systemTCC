import { useState, useEffect } from 'react';
import { supabase } from '../routes/supabase';

export const useTemperature = () => {
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemperatura = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando temperatura do Supabase...');
      const { data, error } = await supabase
        .from('leituras_sensores')
        .select('id, temperatura, data_hora, umidade, fumaca, presenca, local_sensor')
        .order('data_hora', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }

      if (data) {
        console.log('Dados encontrados:', data);
        setTemperatura(data.temperatura);
      } else {
        console.log('Nenhum dado encontrado');
        setTemperatura(null);
      }
    } catch (error) {
      console.error('Error fetching temperature:', error);
      setError('Falha ao buscar temperatura');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatura();

    // Set up real-time subscription
    console.log('Configurando subscription em tempo real...');
    const subscription = supabase
      .channel('leituras_sensores_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'leituras_sensores' 
        }, 
        (payload) => {
          console.log('Nova leitura recebida:', payload.new);
          const newTemp = payload.new.temperatura;
          setTemperatura(newTemp);
        }
      )
      .subscribe((status) => {
        console.log('Status da subscription:', status);
      });

    // Fetch updates every 30 seconds as backup
    const interval = setInterval(() => {
      console.log('Atualização de backup...');
      fetchTemperatura();
    }, 30000);

    return () => {
      console.log('Limpando subscription e interval...');
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { temperatura, loading, error, refetch: fetchTemperatura };
}; 