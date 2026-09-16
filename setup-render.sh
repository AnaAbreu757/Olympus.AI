#!/bin/bash
echo "================================"
echo "  Olympus AI -- Setup para Render"
echo "================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "Erro: Node.js nao esta instalado"
  exit 1
fi

echo "OK Ambiente verificado"
echo ""

echo "Instalando dependencias..."
cd server && npm install && cd ..

echo ""
echo "================================"
echo "  Proximos passos no Render.com"
echo "================================"
echo ""
echo "1. Va a render.com e faz login com GitHub"
echo "2. Clica em 'New +' -> 'Web Service'"
echo "3. Seleciona: AnaAbreu757/Olympus.AI"
echo "4. Deixa as definicoes do render.yaml"
echo "5. Clica em 'Create Web Service'"
echo "6. Em Environment, adiciona:"
echo "   GOOGLE_API_KEY=AIzaSyCwyUU3C52mYunwhVlMVb2VX8QoZ2NHMoY"
echo "7. Pronto! Deploy em 2-3 minutos :)"
echo ""
