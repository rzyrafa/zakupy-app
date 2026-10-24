import { router } from 'expo-router';
import { useState } from 'react';

import { RecipeForm } from '@/components/recipe-form';

export default function CreateRecipeScreen() {
  // zmiana klucza po zapisie = czysty formularz przy następnym wejściu w zakładkę
  const [formKey, setFormKey] = useState(0);

  return (
    <RecipeForm
      key={formKey}
      onSaved={(id) => {
        setFormKey((k) => k + 1);
        router.push({ pathname: '/recipe/[id]', params: { id: String(id) } });
      }}
    />
  );
}
