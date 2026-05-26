/**
 * MirolangPro — the single paywall surface.
 *
 * Renders three pricing tiers (Lifetime → Yearly → Monthly) with the
 * lifetime card styled as the hero (gold border, "Best value" badge,
 * larger). Tapping a tier selects it; the primary CTA purchases the
 * currently-selected tier directly — no second-step modal. Restore
 * purchases link sits below the CTA.
 *
 * Replaces the older two-step flow (this screen → ProVersion bottom
 * sheet) with a single purchase surface for less friction. Per-pair
 * pricing strategy: $71.99 lifetime / $39.99 yearly / $6.99 monthly
 * (US baseline; App Store auto-converts to other currencies).
 */

import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import {useTranslation} from 'react-i18next';
import {
  initIAP,
  teardownIAP,
  loadProducts,
  setupPurchaseListeners,
  purchasePro,
  restorePurchases,
} from '../src/components/iap';
import {setPaywallIntent} from '../src/paywallIntent';

const TIER_TO_PRODUCT = {
  lifetime: 'mirolang_pro_lifetime',
  yearly: 'mirolang_pro_yearly',
  monthly: 'mirolang_pro_monthly',
};

function MirolangPro({
  setShowProScreen,
  getProgress,
  progress,
  navigation,
}) {
  const {t} = useTranslation();
  const [prices, setPrices] = useState({
    lifetime: '',
    yearly: '',
    monthly: '',
    // Numeric for "per month" math on the yearly card.
    yearlyNumeric: 0,
  });
  const [selectedTier, setSelectedTier] = useState('lifetime');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Close helpers — different call sites pass either `setShowProScreen`
  // or a parent-controlled close handler.
  const close = () => {
    setShowProScreen?.(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initIAP();
        setupPurchaseListeners(
          () => {
            if (!mounted) return;
            getProgress?.();
            Alert.alert(
              t('paywall.alert.purchaseSuccessTitle'),
              t('paywall.alert.purchaseSuccessBody'),
              [{text: 'OK', onPress: close}],
            );
            setBusy(false);
          },
          err => {
            if (!mounted) return;
            Alert.alert(
              t('paywall.alert.purchaseErrorTitle'),
              err?.message || String(err),
            );
            setBusy(false);
          },
        );
        const list = await loadProducts();
        if (!mounted) return;
        const next = {lifetime: '', yearly: '', monthly: '', yearlyNumeric: 0};
        for (const p of list || []) {
          if (p.productId === TIER_TO_PRODUCT.lifetime) {
            next.lifetime = p.localizedPrice || '';
          } else if (p.productId === TIER_TO_PRODUCT.yearly) {
            next.yearly = p.localizedPrice || '';
            next.yearlyNumeric = Number(p.price) || 0;
          } else if (p.productId === TIER_TO_PRODUCT.monthly) {
            next.monthly = p.localizedPrice || '';
          }
        }
        setPrices(next);
        setLoaded(true);
      } catch (e) {
        console.warn('MirolangPro load failed:', e);
      }
    })();
    return () => {
      mounted = false;
      teardownIAP();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCtaPress = async () => {
    if (!auth().currentUser?.uid) {
      Alert.alert(
        t('paywall.alert.signInTitle'),
        t('paywall.alert.signInBody'),
        [
          {
            text: 'OK',
            onPress: async () => {
              // Remember intent so the host screen re-opens paywall after
              // the user finishes signing in.
              await setPaywallIntent();
              close();
              navigation?.navigate('Login');
            },
          },
        ],
      );
      return;
    }
    try {
      setBusy(true);
      await purchasePro(TIER_TO_PRODUCT[selectedTier]);
      // Listener handles success/error
    } catch (e) {
      setBusy(false);
      Alert.alert(
        t('paywall.alert.purchaseErrorTitle'),
        e?.message || String(e),
      );
    }
  };

  const handleRestore = async () => {
    try {
      setBusy(true);
      const restored = await restorePurchases();
      setBusy(false);
      Alert.alert(
        restored
          ? t('paywall.alert.restoredTitle')
          : t('paywall.alert.notRestoredTitle'),
        restored
          ? t('paywall.alert.restoredBody')
          : t('paywall.alert.notRestoredBody'),
        [{text: 'OK', onPress: () => restored && close()}],
      );
    } catch (e) {
      setBusy(false);
      Alert.alert(
        t('paywall.alert.purchaseErrorTitle'),
        e?.message || String(e),
      );
    }
  };

  const yearlyPerMonth =
    prices.yearlyNumeric > 0
      ? `~${(prices.yearlyNumeric / 12).toFixed(2)}`
      : null;

  return (
    <View style={styles.root}>
      {/* Close button */}
      <TouchableOpacity onPress={close} style={styles.closeBtn}>
        <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <Rect width="32" height="32" rx="10" fill="#22252E" />
          <Path
            d="M17.175 16.0002L22.425 10.7585C22.5819 10.6016 22.6701 10.3887 22.6701 10.1668C22.6701 9.9449 22.5819 9.73207 22.425 9.57515C22.2681 9.41823 22.0552 9.33008 21.8333 9.33008C21.6114 9.33008 21.3986 9.41823 21.2417 9.57515L16 14.8252L10.7583 9.57515C10.6014 9.41823 10.3886 9.33008 10.1667 9.33008C9.94474 9.33008 9.73191 9.41823 9.57499 9.57515C9.41807 9.73207 9.32991 9.9449 9.32991 10.1668C9.32991 10.3887 9.41807 10.6016 9.57499 10.7585L14.825 16.0002L9.57499 21.2418C9.49688 21.3193 9.43489 21.4115 9.39258 21.513C9.35027 21.6146 9.32849 21.7235 9.32849 21.8335C9.32849 21.9435 9.35027 22.0524 9.39258 22.154C9.43489 22.2555 9.49688 22.3477 9.57499 22.4252C9.65246 22.5033 9.74463 22.5653 9.84618 22.6076C9.94773 22.6499 10.0566 22.6717 10.1667 22.6717C10.2767 22.6717 10.3856 22.6499 10.4871 22.6076C10.5887 22.5653 10.6809 22.5033 10.7583 22.4252L16 17.1752L21.2417 22.4252C21.3191 22.5033 21.4113 22.5653 21.5128 22.6076C21.6144 22.6499 21.7233 22.6717 21.8333 22.6717C21.9433 22.6717 22.0523 22.6499 22.1538 22.6076C22.2554 22.5653 22.3475 22.5033 22.425 22.4252C22.5031 22.3477 22.5651 22.2555 22.6074 22.154C22.6497 22.0524 22.6715 21.9435 22.6715 21.8335C22.6715 21.7235 22.6497 21.6146 22.6074 21.513C22.5651 21.4115 22.5031 21.3193 22.425 21.2418L17.175 16.0002Z"
            fill="white"
          />
        </Svg>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        <Image
          style={{height: 88, width: 88, alignSelf: 'center', marginTop: 8}}
          source={require('../src/fullPro.png')}
        />
        <Image
          style={{width: 173, height: 30, marginTop: 12, alignSelf: 'center'}}
          source={require('../src/miroLangPro.png')}
        />

        <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

        {/* Tier cards */}
        <View style={{width: '100%', marginTop: 24, gap: 10}}>
          <TierCard
            kind="lifetime"
            hero
            title={t('paywall.tier.lifetime')}
            price={prices.lifetime}
            hint={t('paywall.tier.lifetimeHint')}
            badge={t('paywall.bestValue')}
            selected={selectedTier === 'lifetime'}
            onPress={() => setSelectedTier('lifetime')}
            loaded={loaded}
          />
          <TierCard
            kind="yearly"
            title={t('paywall.tier.yearly')}
            price={prices.yearly}
            hint={
              yearlyPerMonth
                ? t('paywall.tier.yearlyHint', {price: yearlyPerMonth})
                : ''
            }
            selected={selectedTier === 'yearly'}
            onPress={() => setSelectedTier('yearly')}
            loaded={loaded}
          />
          <TierCard
            kind="monthly"
            title={t('paywall.tier.monthly')}
            price={prices.monthly}
            hint={t('paywall.tier.monthlyHint')}
            selected={selectedTier === 'monthly'}
            onPress={() => setSelectedTier('monthly')}
            loaded={loaded}
          />
        </View>

        {/* Features list */}
        <View style={{width: '100%', marginTop: 20, gap: 8}}>
          <FeatureRow
            text={t('paywall.feature.unlimited.title')}
          />
          <FeatureRow text={t('paywall.feature.unlock.title')} />
        </View>

        {/* Auto-renew disclosure */}
        <Text style={styles.disclosure}>{t('paywall.autoRenewDisclosure')}</Text>

        {/* Terms + Privacy */}
        <View style={styles.termsRow}>
          <Text style={styles.termsText}>{t('paywall.terms.preamble')}</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://mirolang.ru/terms').catch(() => {})
              }>
              <Text style={styles.termsLink}>{t('paywall.terms.terms')}</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> {t('paywall.terms.and')} </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://mirolang.ru/privacy').catch(() => {})
              }>
              <Text style={styles.termsLink}>{t('paywall.terms.privacy')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed CTA + restore link */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          disabled={busy || !loaded}
          onPress={handleCtaPress}
          style={[styles.cta, (busy || !loaded) && {opacity: 0.6}]}>
          {busy ? (
            <ActivityIndicator color="#14161B" />
          ) : (
            <Text style={styles.ctaText}>{t('paywall.cta')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} disabled={busy} style={{marginTop: 12, alignSelf: 'center'}}>
          <Text style={styles.restoreLink}>{t('paywall.restore')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TierCard({kind, hero, title, price, hint, badge, selected, onPress, loaded}) {
  const accent = hero ? '#F1CC06' : '#313843';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: hero ? 16 : 14,
        borderRadius: 16,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? '#F1CC06' : accent,
        backgroundColor: selected
          ? 'rgba(241, 204, 6, 0.08)'
          : '#1C1F26',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <View style={{flexShrink: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Inter-Bold',
                fontSize: hero ? 18 : 16,
                lineHeight: hero ? 22 : 20,
              }}>
              {title}
            </Text>
            {badge ? (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  backgroundColor: '#F1CC06',
                  borderRadius: 8,
                }}>
                <Text
                  style={{
                    color: '#14161B',
                    fontFamily: 'Inter-Bold',
                    fontSize: 11,
                    lineHeight: 14,
                  }}>
                  {badge}
                </Text>
              </View>
            ) : null}
          </View>
          {hint ? (
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                lineHeight: 16,
                marginTop: 4,
              }}>
              {hint}
            </Text>
          ) : null}
        </View>
        <Text
          style={{
            color: selected || hero ? '#F1CC06' : 'white',
            fontFamily: 'Inter-Bold',
            fontSize: hero ? 22 : 18,
            lineHeight: hero ? 28 : 22,
            marginLeft: 12,
          }}>
          {loaded ? price || '—' : '…'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FeatureRow({text}) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: 'rgba(241, 204, 6, 0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{color: '#F1CC06', fontSize: 12, lineHeight: 14, fontFamily: 'Inter-Bold'}}>
          ✓
        </Text>
      </View>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.85)',
          fontFamily: 'Inter-Regular',
          fontSize: 14,
          lineHeight: 18,
          flexShrink: 1,
        }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#14161B',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: '12%',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
    width: '100%',
  },
  disclosure: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 20,
  },
  termsRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: 'rgba(255, 255, 255, 0.55)',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomBar: {
    backgroundColor: 'rgba(20, 22, 27, 1)',
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  cta: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: '#F1CC06',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#14161B',
  },
  restoreLink: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 16,
    textDecorationLine: 'underline',
  },
});

export default MirolangPro;
