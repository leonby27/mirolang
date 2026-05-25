import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Linking} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import {
  initIAP,
  teardownIAP,
  loadProducts,
  setupPurchaseListeners,
  purchasePro,
  restorePurchases,
  PRODUCT_IDS,
} from './iap';

function ProVersion({closeModal, navigation, learn}) {
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await initIAP();
      setupPurchaseListeners(
        () => {
          if (!mounted) return;
          Alert.alert('Готово', 'Подписка активирована.', [
            {text: 'OK', onPress: () => { closeModal?.(); if (learn) navigation?.goBack(); }},
          ]);
          setBusy(false);
        },
        (err) => {
          if (!mounted) return;
          Alert.alert('Ошибка покупки', err?.message || String(err));
          setBusy(false);
        }
      );
      const list = await loadProducts();
      if (mounted) setProducts(list);
    })();
    return () => {
      mounted = false;
      teardownIAP();
    };
  }, []);

  const onBuy = async (productId) => {
    if (!auth().currentUser?.uid) {
      Alert.alert(
        'Войдите в аккаунт',
        'Чтобы оформить подписку, войдите через Google или Apple.',
        [{text: 'OK', onPress: () => { closeModal?.(); navigation?.navigate('Login'); }}],
      );
      return;
    }
    try {
      setBusy(true);
      await purchasePro(productId);
    } catch (e) {
      setBusy(false);
      Alert.alert('Ошибка', e?.message || String(e));
    }
  };

  const onRestore = async () => {
    try {
      setBusy(true);
      const restored = await restorePurchases();
      setBusy(false);
      Alert.alert(
        restored ? 'Покупки восстановлены' : 'Активных подписок не найдено',
        restored ? 'Pro-доступ активирован.' : 'Если вы оформляли подписку — войдите тем же аккаунтом.',
        [{text: 'OK', onPress: () => restored && closeModal?.()}]
      );
    } catch (e) {
      setBusy(false);
      Alert.alert('Ошибка', e?.message || String(e));
    }
  };

  const monthly = products.find(p => p.productId === 'mirolang_pro_monthly');
  const yearly = products.find(p => p.productId === 'mirolang_pro_yearly');

  return (
    <View style={{flex: 1, backgroundColor: '#14161B'}}>
      <View style={{paddingVertical: 12, paddingHorizontal: 24, alignItems: 'flex-end'}}>
        <TouchableOpacity onPress={closeModal} style={{backgroundColor: '#22252E', borderRadius: 10, padding: 6}}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path d="M11.175 9.998l5.25-5.242c0.157-0.157 0.245-0.37 0.245-0.591s-0.088-0.435-0.245-0.592c-0.157-0.157-0.37-0.245-0.591-0.245s-0.435 0.088-0.592 0.245L10 8.823 4.758 3.573c-0.157-0.157-0.37-0.245-0.591-0.245s-0.435 0.088-0.592 0.245c-0.157 0.157-0.245 0.37-0.245 0.591s0.088 0.435 0.245 0.592L8.825 9.998 3.575 15.24c-0.078 0.077-0.14 0.169-0.182 0.271s-0.064 0.21-0.064 0.32 0.022 0.219 0.064 0.32 0.104 0.193 0.182 0.27c0.078 0.078 0.17 0.14 0.272 0.182s0.21 0.064 0.32 0.064 0.219-0.022 0.32-0.064 0.193-0.104 0.27-0.182L10 11.173l5.242 5.25c0.077 0.078 0.169 0.14 0.27 0.182s0.21 0.064 0.32 0.064 0.219-0.022 0.32-0.064 0.193-0.104 0.27-0.182c0.078-0.077 0.14-0.169 0.182-0.27s0.064-0.21 0.064-0.32-0.022-0.219-0.064-0.32-0.104-0.193-0.182-0.27l-5.25-5.242z" fill="white"/>
          </Svg>
        </TouchableOpacity>
      </View>
      <ScrollView style={{flex: 1, paddingHorizontal: 24}}>
        <Text style={{color: 'white', fontFamily: 'Inter-Bold', fontSize: 24, lineHeight: 32, marginTop: 8}}>
          MiroLang Pro
        </Text>
        <Text style={{color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter-Regular', fontSize: 14, marginTop: 8, lineHeight: 20}}>
          Без ограничения по 10 словам в день. Все уровни сразу. Поддержка разработки.
        </Text>

        {products.length === 0 ? (
          <View style={{marginTop: 32, alignItems: 'center'}}>
            <ActivityIndicator color="white" />
            <Text style={{color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: 'Inter-Regular', fontSize: 14}}>
              Загрузка тарифов…
            </Text>
          </View>
        ) : (
          <>
            {yearly && (
              <TouchableOpacity
                disabled={busy}
                onPress={() => onBuy(yearly.productId)}
                style={{marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: '#1C1F26', borderWidth: 1, borderColor: '#F6A022'}}>
                <Text style={{color: 'white', fontFamily: 'Inter-Bold', fontSize: 16}}>Годовая · {yearly.localizedPrice}</Text>
                <Text style={{color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter-Regular', fontSize: 13, marginTop: 4}}>{yearly.title || 'Подписка на год'}</Text>
              </TouchableOpacity>
            )}
            {monthly && (
              <TouchableOpacity
                disabled={busy}
                onPress={() => onBuy(monthly.productId)}
                style={{marginTop: 12, padding: 16, borderRadius: 12, backgroundColor: '#1C1F26', borderWidth: 1, borderColor: '#313843'}}>
                <Text style={{color: 'white', fontFamily: 'Inter-Bold', fontSize: 16}}>Месячная · {monthly.localizedPrice}</Text>
                <Text style={{color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter-Regular', fontSize: 13, marginTop: 4}}>{monthly.title || 'Подписка на месяц'}</Text>
              </TouchableOpacity>
            )}
            {busy && (
              <View style={{marginTop: 16, alignItems: 'center'}}>
                <ActivityIndicator color="white" />
              </View>
            )}
          </>
        )}

        <TouchableOpacity onPress={onRestore} disabled={busy} style={{marginTop: 24, padding: 12, alignItems: 'center'}}>
          <Text style={{color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter-Regular', fontSize: 14}}>Восстановить покупки</Text>
        </TouchableOpacity>

        {/* Subscription disclosure — required by App Store guideline 3.1.2 */}
        <Text style={{color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16, marginTop: 16}}>
          Подписка продлевается автоматически, если не отменена за 24 часа до окончания периода. Оплата списывается с аккаунта iTunes / Google Play при подтверждении покупки. Управление подпиской — в настройках вашего аккаунта.
        </Text>

        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 12, marginBottom: 24}}>
          <TouchableOpacity onPress={() => Linking.openURL('https://mirolang.ru/terms').catch(() => {})} style={{padding: 8}}>
            <Text style={{color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter-Regular', fontSize: 12, textDecorationLine: 'underline'}}>Условия</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://mirolang.ru/privacy').catch(() => {})} style={{padding: 8}}>
            <Text style={{color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter-Regular', fontSize: 12, textDecorationLine: 'underline'}}>Конфиденциальность</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default ProVersion;
