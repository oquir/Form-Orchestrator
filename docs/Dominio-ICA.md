# Dominio tributario: ICA, retención (ReteICA) y autorretención

> Contexto de negocio para trabajar en las plantillas `industria_comercio`, `retencion_industria_comercio` y `autorretencion`. No describe el código (para eso está `CLAUDE.md`): describe cómo funcionan las declaraciones que el builder modela, para que las decisiones de plantilla y de script tengan fundamento.
>
> **Verificado el 2026-09-22; actualizado el 2026-09-24** con los tipos de declaración, el descuento por pronto pago y las reglas de sistema de sanciones (lo que aún no tiene fuente está en la sección 8). La ley y la estructura de los formularios son estables. Lo que caduca (UVT, bases mínimas, plazos, tasas) está marcado con ⏳ y reunido en "Datos que caducan": antes de usarlo, revisar solo eso, no todo el documento.

## 1. Panorama: tres declaraciones, un solo impuesto

Las tres giran alrededor del **impuesto de industria y comercio (ICA)**, un impuesto **municipal** (no de la DIAN) sobre las actividades industriales, comerciales y de servicios que se realizan en el municipio.

| Declaración | Quién la presenta | Periodo típico | Qué es |
|---|---|---|---|
| **ICA anual** | El contribuyente | Anual (año gravable = año anterior) | La liquidación definitiva del impuesto |
| **Retención (ReteICA)** | El **agente retenedor** (quien paga) | Bimestral, a veces mensual | Lo que le descontó a sus proveedores al pagarles |
| **Autorretención** | El contribuyente **autorretenedor** | Bimestral, a veces mensual | Un anticipo que se liquida sobre sus propios ingresos |

Cómo se conectan: la retención y la autorretención **no son impuestos distintos**, son **cobros anticipados del mismo ICA**. En la declaración anual se restan:

- Lo que **le retuvieron** al contribuyente (con certificados) → **renglón 27** del formulario anual.
- Lo que **se autorretuvo** durante el año → **renglón 28**.

### 1.1 Roles en el RIT

El RIT (Registro de Información Tributaria) es el equivalente municipal del RUT; cada municipio lleva el suyo (el detalle de la inscripción está en la sección 3). Clasifica a cada sujeto según su rol:

- **Contribuyentes**: se inscriben para reportar sus actividades (códigos CIIU) y poder declarar ICA.
- **Agentes retenedores**: asumen la responsabilidad legal de retener el impuesto a terceros. Deben actualizar su RIT con esa responsabilidad para que el portal habilite la declaración de ReteICA.
- **Autorretenedores**: usualmente los designa la Secretaría de Hacienda por resolución; el municipio actualiza su RIT para que no les practiquen ReteICA.

## 2. ICA anual

### Marco legal

- **Normas base**: Ley 14 de 1983, Decreto-ley 1333 de 1986, Ley 1819 de 2016 (arts. 342–344). Cada municipio fija tarifas y detalles en su propio **estatuto tributario** (acuerdo del concejo).
- **Tarifas de ley** (topes; el municipio escoge dentro del rango): **industrial 2–7 por mil**, **comercial y servicios 2–10 por mil**. El sector financiero tiene reglas propias (Decreto 1333, arts. 207–211).
- **Base gravable** (art. 342 Ley 1819): todos los ingresos ordinarios y extraordinarios del año, incluidos rendimientos financieros y comisiones, menos lo expresamente excluido.
- **Territorialidad** (art. 343 Ley 1819): el impuesto se paga donde se realiza la actividad.
  - **Industrial**: donde está la planta. Si el industrial vende lo que él mismo fabrica, eso es el cierre de su actividad industrial y no paga ICA además como comercio.
  - **Comercial**: donde está el establecimiento o punto de venta; si no hay punto físico, donde se perfecciona la venta.
  - **Servicios**: donde se ejecutan, con reglas especiales para transporte, telecomunicaciones, sector financiero y servicios públicos domiciliarios.
- **Periodo**: anual. Se declara en el año N el año gravable N−1. Según el instructivo oficial, **solo Bogotá** puede tener además un periodo distinto del anual (allí algunos contribuyentes declaran bimestralmente).
- **Relación con renta**: desde el año gravable 2023 (Ley 2277 de 2022, art. 19, que modificó el art. 115 del Estatuto Tributario) el ICA **solo se deduce al 100%**; el descuento tributario del 50% ya no existe.
- **Régimen Simple (SIMPLE)**: quien está inscrito paga el ICA **consolidado dentro del SIMPLE**, ante la DIAN: anticipos bimestrales en el formulario 2593 y declaración anual consolidada en el formulario 260, que cubre la obligación de ICA en cada municipio. Consecuencia práctica: **a un contribuyente del SIMPLE no se le practica ReteICA**.

### El Formulario Único Nacional (FUN)

Adoptado por la **Resolución 4056 del 1 de diciembre de 2017** del Ministerio de Hacienda, es obligatorio en todos los municipios desde las declaraciones presentadas a partir del 1 de enero de 2018. **La plantilla `industria_comercio` del builder sigue esta numeración.**

Reglas generales del instructivo:
- Todas las casillas de valores se **aproximan al múltiplo de mil más cercano**; si no hay valor, se escribe 0.
- Los formularios electrónicos deben respetar el contenido y el diseño, pero pueden prediligenciar datos (municipio, códigos DANE), usar listas desplegables e **inhabilitar lo que no aplica** en el municipio (por ejemplo, la sobretasa bomberil donde no existe).
- **Opción de uso**: *declaración inicial*, *solamente pago* (solo se diligencia la sección E) o *corrección*. La corrección **reemplaza toda la declaración anterior**, salvo la sección de pago, donde solo va lo que se paga con la corrección.

| Renglón | Contenido | Cálculo / nota |
|---|---|---|
| **A. Contribuyente** | | |
| 1–5 | Nombre o razón social, tipo y número de documento + DV, dirección, teléfono, correo | Consorcio, unión temporal y patrimonio autónomo se marcan aparte |
| 6 | Número de establecimientos en el municipio | |
| 7 | Clasificación (régimen común o simplificado, según el municipio) | |
| **B. Base gravable** | | |
| 8 | Total de ingresos ordinarios y extraordinarios en todo el país | |
| 9 | Menos ingresos fuera del municipio | Según las reglas de territorialidad |
| 10 | Ingresos en este municipio | 8 − 9 |
| 11 | Menos devoluciones, rebajas y descuentos | |
| 12 | Menos exportaciones | |
| 13 | Menos venta de activos fijos | |
| 14 | Menos actividades excluidas o no sujetas y otros ingresos no gravados | |
| 15 | Menos actividades exentas en el municipio (por acuerdo) | |
| 16 | **Total de ingresos gravables** | 10 − 11 − 12 − 13 − 14 − 15 |
| **C. Actividades** | | |
| tabla | Por actividad (código y tarifa del municipio): ingresos gravados × tarifa | Empieza por la actividad principal |
| 17 | **Total impuesto** | Suma de la columna de impuesto |
| 18 | Generación de energía: kW instalados | Ley 56 de 1981 |
| 19 | Impuesto por generación de energía | kW × valor por kW de ley, actualizado |
| **D. Liquidación** | | |
| 20 | Total impuesto de industria y comercio | 17 + 19 |
| 21 | **Avisos y tableros** | 15% del 20, **solo si tiene avisos** |
| 22 | Unidades comerciales adicionales del sector financiero | Decreto 1333, art. 209 |
| 23 | Sobretasa bomberil | Si el municipio la tiene (Ley 1575 de 2012) |
| 24 | Sobretasa de seguridad | Si el municipio la tiene (Ley 1421 de 2011) |
| 25 | **Total impuesto a cargo** | 20 + 21 + 22 + 23 + 24 |
| 26 | Menos exención o exoneración sobre el impuesto | Distinta de la exención sobre ingresos (15) |
| 27 | **Menos retenciones** | Practicadas **a favor de este municipio**, con certificados |
| 28 | **Menos autorretenciones** | Si el declarante es autorretenedor en este municipio |
| 29 | Menos anticipo liquidado el año anterior | |
| 30 | Anticipo para el año siguiente | Si el municipio lo exige |
| 31 | Sanciones | |
| 32 | Menos saldo a favor del periodo anterior | Si no se pidió devolución ni compensación |
| 33 | **Total saldo a cargo** | 25 − 26 − 27 − 28 − 29 + 30 + 31 − 32, si es ≥ 0 |
| 34 | **Total saldo a favor** | La misma operación, si es < 0 |
| **E. Pago** | | |
| 35 | Valor a pagar | **Puede ser parcial o total** según el instructivo |
| 36 | Descuento por pronto pago | Si el municipio lo tiene |
| 37 | Intereses de mora | |
| 38 | **Total a pagar** | 35 − 36 + 37 |
| 39 | Pago voluntario | Solo municipios que lo tengan |
| 40 | Total a pagar con pago voluntario | 38 + 39 |
| **F. Firmas** | Declarante; contador o revisor fiscal si el municipio lo exige | |

Complementarios y figuras del formulario:
- **Avisos y tableros**: tiene hecho generador propio. El Consejo de Estado lo ha precisado: son avisos, tableros o vallas **en la vía pública o visibles desde ella**. No se cobra automáticamente por tener ICA.
- **Anticipo** (art. 47 de la Ley 43 de 1987): el municipio puede exigir **hasta el 40%** del impuesto como anticipo del año siguiente. Se cobra en el renglón 30 y se resta al año siguiente en el 29.
- **Sobretasa bomberil**: se liquida sobre el ICA; el porcentaje depende del municipio (Bogotá 1%; en otros municipios, 4% o más).

**Dónde se aparta la plantilla del FUN, a propósito** (detalle en `CLAUDE.md`, sección de la plantilla ICA):
- El **35** es `= 33` (no admite pago parcial).
- El **38** es `max(35 − 36 + 37 − 34, 0)`: el `− 34` evita cobrar intereses de mora sobre una deuda que no existe.
- El **31** (sanción) y el **37** (intereses) se liquidan en el `logic.script` del propio renglón.

### Tipos de declaración en el ERP

Además de la "opción de uso" del FUN (inicial, solamente pago, corrección), para el ICA anual el sistema debe contemplar tres naturalezas de formulario:

1. **Inicial (o normal)**: primera presentación del periodo fiscal.
2. **Corrección**: reemplaza jurídica y financieramente a la anterior. **Regla de sistema**: el usuario debe digitar o vincular el ID/sticker de la declaración que va a corregir.
3. **Clausura (cese de actividades o fracción de año)**: se presenta cuando la empresa cierra definitivamente o se traslada. **Regla de sistema**: el formulario exige la **fecha exacta de cierre** (para prorratear topes de ingresos a los meses operados) y, al presentarse, debe gatillar la cancelación del RIT del contribuyente en ese municipio.

Retención y autorretención solo tienen Inicial y Corrección (secciones 3 y 4).

### Descuento por pronto pago

Beneficio potestativo de los concejos municipales (usualmente entre 5% y 15%), pensado para incentivar el pago temprano. Es **exclusivo del ICA anual** (renglón 36): nunca aplica en ReteICA ni en autorretención. Reglas de parametrización en el ERP:

- **Paz y salvo**: el contribuyente no puede deber vigencias anteriores; si debe, el sistema oculta el beneficio.
- **Base de cálculo**: solo sobre el impuesto neto a cargo, jamás sobre sanciones ni intereses.
- **Pérdida del beneficio**: automática si el pago es parcial, extemporáneo o entra en un acuerdo de pago.
- **En correcciones**: si declaró a tiempo con descuento y luego corrige aumentando el impuesto, el descuento se recalcula sobre la base real, pero la diferencia adicional no tiene descuento.

## 3. Retención de ICA (ReteICA)

### Qué es y quién la practica

Es un **mecanismo de recaudo anticipado**, no un impuesto adicional. Quien paga (el **agente retenedor**) descuenta un porcentaje del pago, lo declara, lo consigna al municipio y le entrega un **certificado** al proveedor, que luego lo resta en el renglón 27 de su declaración anual.

- **Es opcional para cada municipio**: si su estatuto no la adoptó, no se practica, aunque el proveedor esté en otra ciudad que sí la aplique.
- **Agentes retenedores**: entidades públicas, grandes contribuyentes y los contribuyentes que el municipio designa por resolución (en Bogotá, por ejemplo, los del régimen común del ICA).
- **A quién no se le retiene**: a los inscritos en el SIMPLE, a los no sujetos, a las actividades exentas y a los autorretenedores. En algunas ciudades tampoco a los grandes contribuyentes, salvo que el pago lo haga una entidad pública o un gran contribuyente (Bogotá, Resolución DDI-000305 de 2020).

### Inscripción en el RIT

El **RIT (Registro de Información Tributaria)** es el registro municipal que identifica y clasifica a cada sujeto **según la calidad en que actúa**: contribuyente, declarante, **agente de retención**, etc. No es el RUT de la DIAN; cada municipio lleva el suyo (algunos lo llaman registro de industria y comercio o matrícula). Los roles se resumen en la sección 1.1.

- La calidad de agente retenedor **nace de la norma o del acto de designación**, no de la inscripción. Pero una vez designado, hay que **inscribirse o actualizar el RIT** con esa responsabilidad, y sin eso el portal no deja presentar la declaración de retención.
- **Medellín (guía oficial de 2026)**: los agentes se designan de dos formas, por el Estatuto Tributario del Distrito (de forma general) o por acto administrativo de la Subsecretaría de Ingresos (de forma particular). Para inscribirse como agente se diligencia el **formulario RIT** y se adjuntan: certificado de existencia y representación legal (con no más de 30 días), RUT, cédula del representante legal y el documento que acredite la condición de agente (designación, mandato o poder). La Subsecretaría revisa y notifica la inscripción.
- **Bogotá**: el RIT registra explícitamente la calidad de agente de retención; los contribuyentes de ICA tienen dos meses desde el inicio de actividades para inscribirse, y las novedades (incluido el cese) se reportan en el mismo RIT.
- Los detalles (formulario, soportes, plazos) dependen de cada municipio.

### Cómo se liquida

- **Base**: el valor del pago **antes de IVA**, solo si supera la **base mínima** del municipio (expresada en UVT).
- **Tarifa**: la del ICA **de la actividad del proveedor**, no la del pagador. Si la actividad no se conoce, muchos estatutos mandan la tarifa más alta. **Hay municipios con tarifa única**: Medellín retiene al **2 por mil**, salvo los pagos a personas o entidades **sin domicilio ni presencia en el país**, a los que se les aplica la tarifa plena de la actividad.
- **Territorialidad**: se retiene a favor del municipio donde **se realiza la actividad**, no donde está el pagador.
- **Retención = base × tarifa (por mil)**, redondeada a mil.

### Periodo

Casi siempre **bimestral**: bimestre 1 = enero–febrero … bimestre 6 = noviembre–diciembre. Algunos municipios son mensuales (Barranquilla, para ciertos contribuyentes). Los plazos suelen depender del **último dígito del NIT**. El banco `FechasMaximasPresentacion` del simulador ya modela esto (periodicidad anual, bimestral, trimestral o mensual × validación por dígito).

### El formulario: no hay uno nacional

El FUN es solo para el ICA anual. La Resolución 4056 dice expresamente que, cuando un municipio establece la retención, **el formulario lo define cada entidad**. En consecuencia:

**Lo que casi todos comparten** (sale del Estatuto Tributario nacional que todos aplican):
- Periodo (año y bimestre o mes) y tipo de declaración.
- Datos del agente retenedor.
- Liquidación: base × tarifa = retención.
- Menos devoluciones, anulaciones, rescisiones y retenciones en exceso.
- Subtotal, sanciones, intereses y total a pagar.
- Firmas.

**Lo que varía entre municipios** (confirmado también por la experiencia del usuario trabajando con estos formularios):
- **Si se detallan las actividades o no.** Hay municipios donde la declaración **no pide actividades**: solo base y tarifa (o bases por concepto). En otros la liquidación va por actividad CIIU.
- Tarifa única (Medellín) frente a una tarifa por actividad; o una división por concepto (compras / servicios, cada uno con su base mínima).
- Periodicidad (bimestral o mensual).
- **Si la retención se declara sola o junto con la autorretención** (Barranquilla, Cartagena, Barrancabermeja, Tunja y Pacho usan un formulario conjunto).
- Si también se retienen los complementarios (avisos y tableros, sobretasa bomberil).
- Campos propios, como el de pagos a no residentes de Medellín, o cómo se clasifican las sanciones.

**Ejemplo real, renglón por renglón: formulario bimestral de Medellín**

| Renglón | Contenido | Cálculo / nota |
|---|---|---|
| 1 | Periodo declarado: vigencia y bimestre (01–06) | El año es aquel en que se practicaron las retenciones |
| 2 | Tipo de declaración: normal, extemporánea, corrección (con el radicado que corrige), respuesta a emplazamiento (con su número), respuesta a auto (con su número) | |
| 3–11 | Documento + DV, nombre, dirección, correo, departamento y municipio (código DANE), teléfonos | |
| 12 | ¿Hubo actividades con personas sin domicilio ni presencia en el país? | Habilita una tarifa distinta de 2 por mil |
| 13–15 | Tabla: **tarifa**, **valor base**, **valor retención** | Retención = base × tarifa, redondeada a mil |
| 16 | Retenciones practicadas en el periodo | Suma de la columna 15 |
| 17 | Devoluciones, anulaciones, rescisiones y retenciones practicadas en exceso | |
| 18 | Subtotal | 16 − 17 |
| 19 | Sanción 1: extemporánea / posterior al emplazamiento | |
| 20 | Sanción 2: corrección / respuesta a auto | |
| 21 | Intereses | |
| 22 | **Total a pagar** | 18 + 19 + 20 + 21 |
| 23–28 | Firmas: representante legal, contador o revisor fiscal, calidad de quien firma | |

### Reglas que lo diferencian del ICA anual (importan para el diseño)

- **Tipos de declaración**: solo Inicial y Corrección. No existe Clausura: la retención es transaccional y no grava la existencia del negocio; si la empresa cierra, simplemente deja de retener en los bimestres siguientes.
- **Sin descuento por pronto pago**: son dineros de terceros, no impuesto propio, y los municipios no lo otorgan en ReteICA.
- **Sin pago total, la declaración no produce efecto** (es ineficaz, sin necesidad de acto administrativo; es la lógica del art. 580-1 del Estatuto Tributario, recogida por Medellín en su estatuto). A diferencia del renglón 35 del FUN, **no hay pago parcial**.
- **No produce saldo a favor.** Lo retenido de más se recupera restándolo en el renglón de devoluciones y anulaciones de ese periodo o de los siguientes.
- **Certificados**: el agente debe expedirlos (plazos y contenido según el municipio; suelen incluir partes, NIT, concepto o actividad, base, valor retenido y periodo). No expedirlos se sanciona (art. 667 del Estatuto Tributario: 5% de los pagos sin certificado). Se conservan 5 años.
- **Sin retenciones en el periodo, no se declara en ceros** (Medellín: si en el bimestre no hubo pagos sujetos a retención, no hay obligación de declarar). Verificar en cada municipio: algunos sí exigen la declaración en ceros.
- **Retención en exceso, anulaciones y devoluciones** (Medellín): el agente puede devolverle el excedente al proveedor o descontarlo en las declaraciones siguientes, en el renglón 17, **anulando los certificados** emitidos y conservando la solicitud escrita del proveedor y los soportes.
- **Si el agente no retiene estando obligado, responde por el valor no retenido**, además de las sanciones.
- **Las sanciones se calculan sobre la retención a cargo** (Medellín: 5% por mes o fracción con tope del 100% antes del emplazamiento; 10% con tope del 200% después; mínima de 10 UVT).
- **Información exógena**: el agente reporta a los terceros a quienes les retuvo, según la resolución del municipio (en Medellín no hay que reportar si en el año no hubo retenciones).
- Los agentes no tienen estado de cuenta ni paz y salvo: la modalidad es "declare y pague", y el soporte son las declaraciones presentadas.
- **Riesgo penal**: no consignar lo retenido puede encuadrar en el art. 402 del Código Penal (omisión del agente retenedor). Es la razón por la que los municipios son tan estrictos con estas declaraciones. Por eso algunos tratan la declaración de retención como un "recibo de pago": no autoliquidan sanciones de corrección ni de inexactitud en el portal y cobran solo intereses de mora diarios sobre el excedente.

## 4. Autorretención

### Qué es

El contribuyente **se practica la retención sobre sus propios ingresos** y la declara y paga cada periodo. Al final del año la resta en el **renglón 28** de su declaración anual. Para el municipio es un anticipo más rápido; como contrapartida, **a un autorretenedor no le retienen** sus clientes.

### Quiénes son

Los designa el municipio por resolución (o lo pide el contribuyente y la administración lo aprueba). Ejemplos:
- **Cartagena**: entidades vigiladas por la Superfinanciera, estaciones de combustible, grandes contribuyentes de la DIAN, empresas de servicios públicos domiciliarios y los que determine la Secretaría de Hacienda.
- **Medellín**: los nombrados por resolución de la Subsecretaría de Ingresos y quienes lo solicitan.

### Cómo se liquida (varía bastante)

- **Cartagena**: base = ingresos gravados en Cartagena durante el bimestre; tarifa = **la tarifa plena del ICA** de la actividad. En la práctica, es el ICA pagado por bimestres. Los autorretenedores no acceden a ciertos descuentos ni liquidan anticipo.
- **Medellín**: por actividad CIIU, base gravable del bimestre × **un porcentaje de la tarifa** que la administración fija cada vigencia (Acuerdo 66 de 2017, art. 73). El sistema propone la tarifa según el código de actividad.
- Algunos municipios (Barranquilla, Cartagena) autorretienen también los **complementarios** (avisos y tableros, sobretasa bomberil).

### Formulario típico

- Periodo (año y bimestre) y tipo de declaración.
- **Tabla por actividad**: código CIIU, base del bimestre, tarifa (plena o porcentaje), valor autorretenido. Es un grupo repetible, igual que las actividades del ICA anual.
- Complementarios, si aplican.
- Sanciones, intereses y total a pagar.
- Firmas.
- **La misma regla de ineficacia**: presentada sin pago total no produce efecto (Medellín lo dice expresamente).
- **Tipos de declaración**: solo Inicial y Corrección; tampoco aplica Clausura ni descuento por pronto pago.
- Puede presentarse por separado o en un formulario conjunto con el de ReteICA (Barranquilla y Cartagena, entre otros; ver sección 3).

## 5. Sanciones e intereses (aplican a las tres)

El sistema debe diferenciar estrictamente qué sanciones autoliquida el usuario (extemporaneidad, corrección) y cuáles impone la alcaldía (inexactitud).

- **Art. 59 de la Ley 788 de 2002**: los municipios aplican el procedimiento y el régimen sancionatorio del **Estatuto Tributario nacional**. **Pueden reducir el monto de las sanciones y simplificar los procedimientos, pero no imponer sanciones mayores ni distintas.** Es el fundamento de la regla del proyecto: *la ley es el tope por defecto, el municipio solo puede bajarla*.
- **Extemporaneidad antes del emplazamiento** (art. 641): 5% por mes o fracción, con tope del 100%.
- **Extemporaneidad después del emplazamiento** (art. 642): 10% por mes o fracción, con tope del 200%. Por eso los formularios de retención separan dos tipos de sanción.
- **Regla en correcciones**: si la declaración inicial se presentó a tiempo, en la de corrección **no se liquida extemporaneidad**.
- **Emplazamiento**: notificación formal de la alcaldía que separa la sanción voluntaria de la agravada. En ambos casos da 1 mes de plazo:
  - **Para declarar** (art. 715 ETN): notifica la omisión de presentar. Si el contribuyente declara, la extemporaneidad pasa al 10% por mes; si no, la alcaldía emite *liquidación oficial de aforo*.
  - **Para corregir** (art. 688 ETN): notifica inconsistencias detectadas. Si el contribuyente corrige, la sanción por corrección pasa al 20%; si no, la alcaldía emite *requerimiento especial*.
- **Sanción mínima de 10 UVT** (art. 639) y **gradualidad** (art. 640). El sistema debe comparar la sanción calculada con el mínimo (en 2026, $523.740) y cobrar la mayor.
- **Corrección frente a inexactitud**: las dos tratan de un error en lo declarado; la diferencia está en **quién lo detecta**.
  - **Corrección** (art. 644): el contribuyente corrige **por su cuenta** y paga **10%** del mayor valor a pagar (o del menor saldo a favor) si corrige antes de cualquier actuación de la administración, o **20%** si corrige después del emplazamiento para corregir o del auto de inspección, pero antes del requerimiento especial. Se autoliquida en la propia declaración de corrección. Solo aplica si la corrección **sube** el valor a pagar o **baja** el saldo a favor; corregir a la baja sigue otro trámite (art. 589) que la administración tiene que aprobar.
    - **Corrección dentro del plazo legal de presentación**: sin sanción ni intereses, y conserva el descuento por pronto pago.
    - **Corrección fuera de plazo (mayor valor)**: se cobran intereses de mora solo sobre la diferencia.
    - **Regla de sistema para la corrección a la baja (menor valor, art. 589)**: es un riesgo de fraude, así que el ERP **debe bloquear** la liquidación automática y dejar el estado en "Proyecto de Corrección", sin validez de pago. El contribuyente aporta pruebas y, si la alcaldía aprueba mediante acto administrativo, el sistema genera el **saldo a favor** para compensación o devolución.
  - **Inexactitud** (arts. 647–648): la administración **encuentra** ingresos omitidos, costos o descuentos inexistentes, retenciones que no existieron, datos falsos, etc. La sanción es **100%** de la diferencia entre lo que determina la administración y lo declarado (200% en casos de abuso). Se reduce a una cuarta parte si el contribuyente acepta los hechos al responder el requerimiento especial y corrige (art. 709), o a la mitad si los acepta al recurrir la liquidación oficial (art. 713). Una diferencia de criterio sobre cómo interpretar el derecho aplicable **no es inexactitud**, siempre que los hechos y las cifras declarados sean completos y verdaderos.
  - **En los formularios**: la sanción por corrección la liquida el contribuyente al corregir (por ejemplo, la "sanción 2" del formulario de Medellín). La de inexactitud normalmente la impone la administración en un acto oficial; solo aparece en la declaración cuando el contribuyente corrige aceptando un requerimiento especial, con la sanción reducida. **Regla de sistema**: el portal no debe permitir autoliquidarla; es de uso exclusivo del módulo interno de fiscalización de la alcaldía (la excepción es esa corrección que acepta un requerimiento especial).
  - Los municipios pueden bajar estos porcentajes, pero no subirlos. En la plantilla ICA **ninguna de las dos está construida**: las dos necesitan la declaración anterior, que todavía no existe (ver `CLAUDE.md`, "Sanciones").
- **Intereses de mora** (arts. 634–635): diarios, con la tasa de usura menos 2 puntos vigente al momento del pago.
- Lo implementado y lo descartado a propósito en la plantilla ICA está en `CLAUDE.md` ("Sanciones", "Intereses de mora").

## 6. Implicaciones para el builder

- **Retención y autorretención reutilizan casi todo lo que ya existe**:
  - La tabla (tarifa × base, o actividad × base × tarifa) es un `RepeatableGroup`. Cuando el municipio no pide actividades, es solo una o varias filas de base y tarifa.
  - Omiten la lógica de clausura y de pronto pago, que no existen en ninguna de las dos.
  - Los helpers `fechaLimite(año, periodo, documento)`, `diasDeMora` y `mesesDeMora` ya reciben el periodo. En el ICA anual es `const periodo = 1`; aquí sale del bimestre elegido.
  - El banco `FechasMaximasPresentacion` ya tiene las listas `reteica` y `autoretencionIca`, hoy vacías a propósito (no inventar plazos).
  - El redondeo al mil y el patrón de sanción e intereses en el `logic.script` del renglón.
- **La diferencia de fondo es el pago**: el total a pagar tiene que ser el 100% (sin pago parcial) y no hay saldo a favor.
- **El tipo de declaración** (normal, extemporánea, corrección, respuesta a emplazamiento o a auto) decide qué sanción aplica. Es la misma pieza que hoy falta para el art. 642 en el ICA anual.
- **Bloqueo de periodos**: una corrección exige el ID de una declaración inicial aprobada.
- **Herencia de saldos**: en una corrección, el sistema debe traer automáticamente como crédito lo ya pagado en la declaración inicial.
- **Exclusión mutua**: en el frontend, o se cobra extemporaneidad (llegó tarde) o se cobra corrección (se equivocó).
- **Plantilla base + ajuste por municipio**: como no hay formulario nacional, la plantilla debe partir de lo común y dejar opcionales las variaciones (actividades sí o no, complementarios, pagos a no residentes, formulario conjunto de retención y autorretención).
- **Falta el contrato con el consumidor**: `PAYLOAD_SCHEMA` solo describe `DeclaracionIcaE`. `retencion_industria_comercio` y `autorretencion` arrancan en blanco en el wizard y no tienen payload definido.

## 7. Datos que caducan ⏳

Todos verificados el 2026-09-22. Revisar antes de reutilizarlos.

| Dato | Valor | Vigencia |
|---|---|---|
| UVT | $52.374 | 2026 |
| Sanción mínima (10 UVT) | $523.740 | 2026 |
| Base mínima ReteICA Bogotá | Servicios 4 UVT · compras 27 UVT | 2026 |
| Base mínima ReteICA Barranquilla | Servicios 4 UVT · compras 27 UVT | 2026 |
| Base mínima ReteICA Cali | Servicios 3 UVT · compras 15 UVT | 2026 |
| Base mínima ReteICA Medellín | 15 UVT para todo pago (tarifa 2 por mil) | 2026 |
| Base mínima ReteICA Bucaramanga | Servicios 25 UVT · compras 50 UVT | 2026 |
| Plazos ReteICA Bogotá | 20 mar, 22 may, 17 jul, 18 sep, 20 nov de 2026; 15 ene de 2027 | 2026 |
| Tasa de interés de mora | 27,66% E.A. (usura − 2 puntos) | Agosto de 2026; se usa en `INTERES_MORA_SCRIPT` |

## 8. Sin verificar o pendiente

- El único formulario de **retención** leído completo, renglón por renglón, es el de **Medellín**. Lo de las demás ciudades sale de fuentes secundarias y de las páginas de las alcaldías, no del formulario. **Los formularios reales de los municipios con los que trabaja el usuario valen más que este documento**: si aparecen, agregarlos aquí.
- No se leyó completo ningún formulario de **autorretención** (el de Medellín es un manual de portal sin renglones numerados).
- Umbral exacto a partir del cual un contribuyente declara bimestralmente en Bogotá: no verificado.
- Lo incorporado el 2026-09-24 (tipos de declaración y clausura, descuento por pronto pago, reglas de sistema de sanciones) no trae fuente citada; confirmar con el estatuto de cada municipio.
- **Art. 688 ETN** como base del emplazamiento para corregir (sección 5): confirmar el artículo exacto (posible confusión con el art. 685).
- El renglón 2 del formulario de Medellín lista más opciones que Inicial y Corrección (extemporánea, respuesta a emplazamiento, respuesta a auto); confirmar si el sistema las modela como campos de contexto y no como otro tipo de declaración.

## Fuentes

- [Instructivo del Formulario Único Nacional ICA (Resolución 4056 de 2017)](https://www.giron-santander.gov.co/Transparencia/BancoDocumentos/INSTRUCTIVO%20DILIGENCIAMIENTO%20FORMULARIO%20UNICO%20NACIONAL%20-%202018.pdf)
- [MinHacienda: formulario del impuesto de industria y comercio](https://www.minhacienda.gov.co/apoyo-fiscal-territorial/formulario-impuesto-de-industria-y-comercio)
- [Formulario e instructivo de ReteICA de Medellín](https://www.medellin.gov.co/irj/go/km/docs/pccdesign/SubportaldelCiudadano_2/PlandeDesarrollo_0_9/ProgramasyProyectos/Shared%20Content/Documentos/PortalTributario/Formulario%20ReteIca.pdf) (WebFetch no lo lee: bajarlo con `curl -A "Mozilla/5.0"` y extraer el texto con `pdftotext`)
- [Guía de preguntas frecuentes de retención ICA de Medellín (2026)](https://www.medellin.gov.co/es/wp-content/uploads/2026/03/5.-DE-GEHA-ING-Guia-de-Preguntas-y-Respuestas-Frecuentes_Declaracion-Bimestral-de-Retenciones-de-Industria-y-Comercio.pdf) (fuente primaria: RIT, retención en exceso, declaración en ceros, sanciones, exógena). Cita el **Acuerdo 93 de 2023** como estatuto vigente de Medellín; el formulario de ReteICA enlazado arriba puede ser de una versión anterior.
- [Bogotá: cómo obtener el RIT (2026)](https://bogota.gov.co/mi-ciudad/hacienda/como-obtener-el-registro-de-informacion-tributaria-rit-en-bogota-2026)
- [Manual de autorretenedores ICA de Medellín](https://www.medellin.gov.co/irj/go/km/docs/pccdesign/medellin/Temas/Hacienda/Programas/Shared%20Content/Documentos/2021/Manual-Tecnico-Registro-declaracion-Agentes-Autorretencion-ICA.pdf)
- [Gerencie: retención en la fuente por ICA](https://www.gerencie.com/retencion-en-la-fuente-en-el-ica.html)
- [Alegra: retención de ICA 2026](https://blog.alegra.com/colombia/certificado-retencion-de-ica/)
- [Leegales: tabla de ReteICA 2026 por ciudad](https://leegales.com/reteica-retencion-en-la-fuente-en-el-ica/)
- [vLex: sistema de autorretenedores de ICA en Cartagena](https://vlex.com.co/vid/opera-sistema-ica-cartagena-indias-455371414)
- [Barrancabermeja: declaración de retención y autorretención](https://www.barrancabermeja.gov.co/tramites/5/declaracion-privada-de-retencion-y-autorretencion-en-la-fuente-de-industria-y-comercio/)
- [Actualícese: territorialidad del ICA](https://actualicese.com/territorialidad-del-impuesto-de-industria-y-comercio/)
- [Actualícese: descuento por ICA tras la Ley 2277 de 2022](https://actualicese.com/descuento-por-industria-y-comercio-estos-son-los-cambios-de-la-reforma-tributaria-2022/)
- [DIAN: declaración anual consolidada del Régimen Simple](https://micrositios.dian.gov.co/regimen-simple-tributacion/declaracion-anual-consolidada-rst/)
- [Ley 788 de 2002 (art. 59)](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=7260)
- Estatuto Tributario Nacional (arts. 589, 641, 644, 647, 688, 715)
- [Ámbito Jurídico: hecho generador de avisos y tableros](https://www.ambitojuridico.com/noticias/tributario/asi-se-determina-el-hecho-generador-del-impuesto-de-avisos-y-tableros-1104-am)